'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { contractTermsSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'
import { signWithQes } from '@/lib/qes'
import { processPayment } from '@/lib/payments'
import { paymentReference } from '@/lib/hash'
import { formatRon } from '@/lib/dashboardData'
import { COMMISSION_PERCENT } from '@/lib/constants'

const RENT_DUE_DAYS = 5

// Proprietarul editează termenii contractului înainte de semnare (cât e IN_ASTEPTARE).
export async function setContractTermsAction(contractId: string, input: unknown) {
  try {
    const user = await requireActionUser()
    const contract = await prisma.contract.findUnique({ where: { id: contractId } })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }
    if (user.role !== 'ADMIN' && contract.ownerId !== user.id) {
      return { ok: false as const, error: 'Doar proprietarul poate edita termenii.' }
    }
    if (contract.status !== 'IN_ASTEPTARE') {
      return { ok: false as const, error: 'Termenii pot fi modificați doar înainte de semnare.' }
    }

    const data = contractTermsSchema.parse(input)
    const endDate = new Date(data.startDate)
    endDate.setMonth(endDate.getMonth() + data.months)

    await prisma.contract.update({
      where: { id: contractId },
      data: {
        rent: data.rent,
        deposit: data.deposit,
        months: data.months,
        dueDay: data.dueDay,
        startDate: data.startDate,
        endDate,
        clauses: data.clauses?.trim() || null,
      },
    })
    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function signContractAction(contractId: string) {
  try {
    const user = await requireActionUser()
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { property: true, owner: true, tenant: true },
    })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }

    const isOwner = contract.ownerId === user.id
    const isTenant = contract.tenantId === user.id
    if (!isOwner && !isTenant) return { ok: false as const, error: 'Nu ești parte în acest contract.' }
    if (contract.status !== 'IN_ASTEPTARE' && contract.status !== 'SEMNAT') {
      return { ok: false as const, error: 'Contractul nu mai poate fi semnat.' }
    }
    if ((isOwner && contract.signedByOwner) || (isTenant && contract.signedByClient)) {
      return { ok: false as const, error: 'Ai semnat deja acest contract.' }
    }

    const qes = await signWithQes({
      contractId: contract.id,
      signerEmail: user.email,
      signerName: `${user.firstName} ${user.lastName}`,
    })
    if (!qes.ok) return { ok: false as const, error: 'Semnarea QES a eșuat.' }

    const signedByOwner = contract.signedByOwner || isOwner
    const signedByClient = contract.signedByClient || isTenant
    const bothSigned = signedByOwner && signedByClient

    await prisma.contract.update({
      where: { id: contractId },
      data: {
        signedByOwner,
        signedByClient,
        qes: true,
        status: bothSigned ? 'ACTIV' : 'SEMNAT',
        startDate: bothSigned ? new Date() : contract.startDate,
      },
    })

    if (bothSigned) {
      // Contract activ: proprietatea devine închiriată și prima chirie devine scadentă.
      await prisma.property.update({ where: { id: contract.propertyId }, data: { status: 'INCHIRIATA' } })
      await prisma.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.tenantId,
          contractId: contract.id,
          amount: contract.rent,
          type: 'CHIRIE',
          status: 'IN_CURS',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * RENT_DUE_DAYS),
        },
      })
      const message = `Contractul pentru „${contract.property.title}” este activ. Prima chirie este scadentă în ${RENT_DUE_DAYS} zile.`
      await notify(contract.tenantId, 'Contract activ', message, 'success')
      await notify(contract.ownerId, 'Contract activ', message, 'success')
    } else {
      const otherParty = isOwner ? contract.tenantId : contract.ownerId
      await notify(
        otherParty,
        'Semnătură necesară',
        `${user.firstName} ${user.lastName} a semnat contractul pentru „${contract.property.title}”. Mai lipsește semnătura ta.`,
        'warning'
      )
    }

    revalidatePath('/dashboard', 'layout')
    revalidatePath('/proprietati', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function payRentAction(contractId: string) {
  try {
    const user = await requireActionUser()
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { property: true },
    })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }
    if (contract.tenantId !== user.id) return { ok: false as const, error: 'Doar chiriașul poate plăti chiria.' }
    if (contract.status !== 'ACTIV') return { ok: false as const, error: 'Contractul nu este activ.' }

    const due = await prisma.payment.findFirst({
      where: { contractId: contract.id, type: 'CHIRIE', status: 'IN_CURS' },
      orderBy: { dueDate: 'asc' },
    })
    if (!due) return { ok: false as const, error: 'Nu există nicio chirie scadentă.' }

    const result = await processPayment({
      amount: due.amount,
      description: `Chirie „${contract.property.title}” (${due.reference})`,
      payerEmail: user.email,
    })
    if (!result.ok) {
      await prisma.payment.update({ where: { id: due.id }, data: { status: 'ESUATA' } })
      return { ok: false as const, error: result.error ?? 'Plata a eșuat.' }
    }

    const commission = Math.round((due.amount * COMMISSION_PERCENT) / 100)
    const paidCount = await prisma.payment.count({
      where: { contractId: contract.id, type: 'CHIRIE', status: 'FINALIZATA' },
    })
    const nextDueDate = due.dueDate
      ? new Date(new Date(due.dueDate).setMonth(due.dueDate.getMonth() + 1))
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    const hasNextRent = paidCount + 1 < contract.months

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({ where: { id: due.id }, data: { status: 'FINALIZATA', paidAt: new Date() } })
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
      if (hasNextRent) {
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
    })

    await notify(
      contract.ownerId,
      'Chirie încasată',
      `${user.firstName} ${user.lastName} a plătit ${formatRon(due.amount)} pentru „${contract.property.title}”.`,
      'success'
    )

    revalidatePath('/dashboard', 'layout')
    revalidatePath('/proprietati', 'layout')
    return { ok: true as const, reference: due.reference }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
