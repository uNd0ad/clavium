'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { contractTermsSchema, saleTermsSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'
import { signWithQes, contractDocumentHash } from '@/lib/qes'
import { createCheckoutSession } from '@/lib/payments'
import { settlePayment } from '@/lib/paymentSettle'
import { paymentReference } from '@/lib/hash'
import { formatRon } from '@/lib/dashboardData'
import { requestBaseUrl } from '@/lib/appUrl'
import { firstRentDueDate } from '@/lib/contractDates'

// Proprietarul editează termenii contractului înainte de semnare (cât e IN_ASTEPTARE).
export async function setContractTermsAction(contractId: string, input: unknown) {
  try {
    const user = await requireActionUser()
    const contract = await prisma.contract.findUnique({ where: { id: contractId } })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }
    if (user.role !== 'ADMIN' && contract.ownerId !== user.id) {
      return { ok: false as const, error: 'Doar proprietarul poate edita termenii.' }
    }
    if (contract.type !== 'INCHIRIERE') {
      return { ok: false as const, error: 'Termenii de închiriere se aplică doar contractelor de locațiune.' }
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

// Vânzătorul editează termenii antecontractului de vânzare înainte de semnare (cât e IN_ASTEPTARE).
export async function setSaleTermsAction(contractId: string, input: unknown) {
  try {
    const user = await requireActionUser()
    const contract = await prisma.contract.findUnique({ where: { id: contractId } })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }
    if (user.role !== 'ADMIN' && contract.ownerId !== user.id) {
      return { ok: false as const, error: 'Doar vânzătorul poate edita termenii.' }
    }
    if (contract.type !== 'VANZARE') {
      return { ok: false as const, error: 'Termenii de vânzare se aplică doar antecontractelor de vânzare.' }
    }
    if (contract.status !== 'IN_ASTEPTARE') {
      return { ok: false as const, error: 'Termenii pot fi modificați doar înainte de semnare.' }
    }

    const data = saleTermsSchema.parse(input)
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        price: data.price,
        deposit: data.deposit,
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

    // Amprenta documentului în momentul semnării — leagă semnătura de termenii curenți.
    const documentHash = contractDocumentHash(contract)
    const signerName = `${user.firstName} ${user.lastName}`
    const qes = await signWithQes({
      contractId: contract.id,
      signerEmail: user.email,
      signerName,
      documentHash,
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
      },
    })

    // Pistă de audit a semnăturii (cine, când, ce referință QES, ce amprentă de document).
    await prisma.signature.upsert({
      where: { contractId_signerId: { contractId: contract.id, signerId: user.id } },
      create: {
        contractId: contract.id,
        signerId: user.id,
        role: isOwner ? 'OWNER' : 'CLIENT',
        signerName,
        signerEmail: user.email,
        signatureRef: qes.signatureRef,
        provider: qes.provider,
        qes: qes.qes,
        documentHash,
      },
      update: {
        signatureRef: qes.signatureRef,
        provider: qes.provider,
        qes: qes.qes,
        documentHash,
        signedAt: new Date(),
      },
    })

    if (bothSigned && contract.type === 'VANZARE') {
      // Antecontract semnat de ambele părți: avansul (arvuna) devine scadent.
      await prisma.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.tenantId,
          contractId: contract.id,
          amount: contract.deposit,
          type: 'AVANS',
          status: 'IN_CURS',
        },
      })
      const message = `Antecontractul pentru „${contract.property.title}” este activ. Avansul de ${formatRon(contract.deposit)} este scadent.`
      await notify(contract.tenantId, 'Antecontract activ', message, 'success')
      await notify(contract.ownerId, 'Antecontract activ', message, 'success')
    } else if (bothSigned) {
      const effectiveStart = contract.startDate ?? new Date()
      const firstDue = firstRentDueDate(effectiveStart, contract.dueDay)
      const dueLabel = firstDue.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })

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
          dueDate: firstDue,
        },
      })
      const message = `Contractul pentru „${contract.property.title}” este activ. Prima chirie este scadentă pe ${dueLabel}.`
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

    const baseUrl = await requestBaseUrl()
    const checkout = await createCheckoutSession({
      payment: due,
      description: `Chirie „${contract.property.title}” (${due.reference})`,
      payerEmail: user.email,
      // Trecem prin /api/payments/confirm: decontează pe loc la întoarcere (nu așteptăm webhook-ul).
      successUrl: `${baseUrl}/api/payments/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard/contracte?plata=anulat`,
    })

    // Producție: clientul este redirecționat către Stripe; decontarea se face în webhook.
    if (checkout.mode === 'redirect') {
      return { ok: true as const, redirectUrl: checkout.url }
    }

    // Mod dev (fără Stripe configurat): decontăm plata pe loc.
    await settlePayment(due.id)
    return { ok: true as const, reference: due.reference }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Plata unei tranșe dintr-un antecontract de vânzare: întâi avansul (AVANS), apoi diferența (REST).
// La achitarea diferenței: comision către proprietar, contract încheiat, proprietatea vândută
// și transferată cumpărătorului.
export async function paySaleAction(contractId: string) {
  try {
    const user = await requireActionUser()
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: { property: true },
    })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }
    if (contract.type !== 'VANZARE') return { ok: false as const, error: 'Contractul nu este de vânzare.' }
    if (contract.tenantId !== user.id) return { ok: false as const, error: 'Doar cumpărătorul poate plăti.' }
    if (contract.status !== 'ACTIV') return { ok: false as const, error: 'Antecontractul nu este activ.' }

    const due = await prisma.payment.findFirst({
      where: { contractId: contract.id, type: { in: ['AVANS', 'REST'] }, status: 'IN_CURS' },
      orderBy: { createdAt: 'asc' },
    })
    if (!due) return { ok: false as const, error: 'Nu există nicio plată scadentă.' }

    const baseUrl = await requestBaseUrl()
    const checkout = await createCheckoutSession({
      payment: due,
      description: `${due.type === 'AVANS' ? 'Avans' : 'Diferență preț'} „${contract.property.title}” (${due.reference})`,
      payerEmail: user.email,
      // Trecem prin /api/payments/confirm: decontează pe loc la întoarcere (nu așteptăm webhook-ul).
      successUrl: `${baseUrl}/api/payments/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard/contracte?plata=anulat`,
    })

    // Producție: clientul este redirecționat către Stripe; decontarea se face în webhook.
    if (checkout.mode === 'redirect') {
      return { ok: true as const, redirectUrl: checkout.url }
    }

    // Mod dev (fără Stripe configurat): decontăm plata pe loc.
    await settlePayment(due.id)
    return { ok: true as const, reference: due.reference }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
