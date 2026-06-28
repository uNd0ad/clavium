import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { notify } from '@/lib/notify'
import { paymentReference } from '@/lib/hash'
import { formatRon } from '@/lib/dashboardData'
import { rentCommission, saleCommission } from '@/lib/commission'
import { addMonths } from '@/lib/contractDates'
import { recordAuditSafe } from '@/lib/audit'

type SettleablePayment = Awaited<ReturnType<typeof loadPayment>>

function loadPayment(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: { contract: { include: { property: true } }, user: true },
  })
}

// Confirmă o plată scadentă (CHIRIE / AVANS / REST) și aplică efectele de business:
// comision, următoarea scadență, încheierea contractului, transferul proprietății.
//
// Idempotentă: claim-ul atomic (IN_CURS → FINALIZATA) garantează că un webhook livrat
// de mai multe ori sau o reîncercare nu dublează comisioanele și nici scadențele.
export async function settlePayment(paymentId: string): Promise<void> {
  const payment = await loadPayment(paymentId)
  if (!payment || !payment.contract) return
  if (payment.status !== 'IN_CURS') return

  if (payment.type === 'CHIRIE') {
    await settleRent(payment)
  } else if (payment.type === 'AVANS' || payment.type === 'REST') {
    await settleSale(payment)
  }
}

async function settleRent(payment: NonNullable<SettleablePayment>) {
  const contract = payment.contract!
  const commission = rentCommission(payment.amount)
  const nextDueDate = payment.dueDate
    ? addMonths(payment.dueDate, 1)
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

  const settled = await prisma.$transaction(async (tx) => {
    // Tranziție atomică: doar prima cerere care prinde plata IN_CURS o finalizează.
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: 'IN_CURS' },
      data: { status: 'FINALIZATA', paidAt: new Date() },
    })
    if (claimed.count === 0) return false

    // Comisionul platformei, înregistrat în contul proprietarului.
    await tx.payment.create({
      data: {
        reference: paymentReference(),
        userId: contract.ownerId,
        contractId: contract.id,
        amount: commission,
        type: 'COMISION',
        status: 'FINALIZATA',
        paidAt: new Date(),
      },
    })
    // Numărăm chiriile achitate (inclusiv cea de acum) în interiorul tranzacției, ca să fie consistent.
    const paidCount = await tx.payment.count({
      where: { contractId: contract.id, type: 'CHIRIE', status: 'FINALIZATA' },
    })
    if (paidCount < contract.months) {
      await tx.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.tenantId,
          contractId: contract.id,
          amount: contract.rent,
          type: 'CHIRIE',
          status: 'IN_CURS',
          dueDate: nextDueDate,
        },
      })
    } else {
      // Ultima chirie: contractul se încheie, proprietatea redevine disponibilă.
      await tx.contract.update({ where: { id: contract.id }, data: { status: 'INCHEIAT' } })
      await tx.property.update({ where: { id: contract.propertyId }, data: { status: 'DISPONIBILA' } })
    }
    return true
  })

  // Plata era deja finalizată (reîncercare / livrare dublă a webhook-ului) — idempotent.
  if (!settled) return

  await notify(
    contract.ownerId,
    'Chirie încasată',
    `${payment.user.firstName} ${payment.user.lastName} a plătit ${formatRon(payment.amount)} pentru „${contract.property.title}”.`,
    'success'
  )
  await recordAuditSafe({
    actorId: payment.userId,
    action: 'PAYMENT_SETTLED',
    entityType: 'PAYMENT',
    entityId: payment.id,
    metadata: { contractId: contract.id, type: 'CHIRIE', amount: payment.amount, commission, reference: payment.reference },
  })

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/proprietati', 'layout')
}

async function settleSale(payment: NonNullable<SettleablePayment>) {
  const contract = payment.contract!
  const isAvans = payment.type === 'AVANS'
  const balance = contract.price - contract.deposit
  const commission = saleCommission(contract.price)
  // Dacă avansul acoperă tot prețul (avans == preț), nu mai rămâne diferență: vânzarea se finalizează acum,
  // fără să creăm o tranșă REST de 0 lei.
  const finalized = !isAvans || balance <= 0

  const settled = await prisma.$transaction(async (tx) => {
    // Tranziție atomică: doar prima cerere care prinde plata IN_CURS o finalizează (anti-dublare).
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: 'IN_CURS' },
      data: { status: 'FINALIZATA', paidAt: new Date() },
    })
    if (claimed.count === 0) return false

    if (!finalized) {
      // Avans achitat, mai rămâne diferență: diferența de preț devine scadentă.
      await tx.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.tenantId,
          contractId: contract.id,
          amount: balance,
          type: 'REST',
          status: 'IN_CURS',
        },
      })
    } else {
      // Preț integral achitat: comision pentru proprietar, vânzare finalizată, transfer de proprietate.
      await tx.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.ownerId,
          contractId: contract.id,
          amount: commission,
          type: 'COMISION',
          status: 'FINALIZATA',
          paidAt: new Date(),
        },
      })
      await tx.contract.update({ where: { id: contract.id }, data: { status: 'INCHEIAT' } })
      await tx.property.update({
        where: { id: contract.propertyId },
        data: { status: 'VANDUTA', ownerId: contract.tenantId },
      })
    }
    return true
  })

  // Plata era deja finalizată (reîncercare / livrare dublă a webhook-ului) — idempotent.
  if (!settled) return

  if (!finalized) {
    await notify(
      contract.ownerId,
      'Avans încasat',
      `${payment.user.firstName} ${payment.user.lastName} a plătit avansul de ${formatRon(payment.amount)} pentru „${contract.property.title}”.`,
      'success'
    )
  } else {
    await notify(
      contract.ownerId,
      'Vânzare finalizată',
      `Vânzarea pentru „${contract.property.title}” a fost finalizată. Diferența de ${formatRon(payment.amount)} a fost încasată.`,
      'success'
    )
    await notify(
      contract.tenantId,
      'Proprietate achiziționată',
      `Felicitări! Ești noul proprietar al imobilului „${contract.property.title}”.`,
      'success'
    )
  }
  await recordAuditSafe({
    actorId: payment.userId,
    action: 'PAYMENT_SETTLED',
    entityType: 'PAYMENT',
    entityId: payment.id,
    metadata: { contractId: contract.id, type: payment.type, amount: payment.amount, finalized, reference: payment.reference },
  })

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/proprietati', 'layout')
}
