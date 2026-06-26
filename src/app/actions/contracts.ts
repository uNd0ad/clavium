'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { contractTermsSchema, saleTermsSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'
import { verifyQesSignature, contractDocumentHash } from '@/lib/qes'
import { createCheckoutSession } from '@/lib/payments'
import { settlePayment } from '@/lib/paymentSettle'
import { paymentReference } from '@/lib/hash'
import { formatRon } from '@/lib/dashboardData'
import { requestBaseUrl } from '@/lib/appUrl'
import { firstRentDueDate, addMonths } from '@/lib/contractDates'

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
    const endDate = addMonths(data.startDate, data.months)

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

export type SignatureInput = {
  certificatePem: string
  signatureValue: string // base64, peste UTF-8(documentHash)
  chainPem?: string[]
}

export async function signContractAction(contractId: string, signature: SignatureInput) {
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
    if (!signature?.certificatePem || !signature?.signatureValue) {
      return { ok: false as const, error: 'Lipsește certificatul sau semnătura.' }
    }

    // Amprenta documentului în momentul semnării — leagă semnătura de termenii curenți.
    const documentHash = contractDocumentHash(contract)
    const signerName = `${user.firstName} ${user.lastName}`

    // Verificare QES: certificat calificat + semnătură peste amprenta documentului.
    const qes = await verifyQesSignature({
      documentHash,
      certificatePem: signature.certificatePem,
      signatureValue: signature.signatureValue,
      chainPem: signature.chainPem,
    })
    if (!qes.ok) return { ok: false as const, error: qes.error }

    // Referință stabilă a semnăturii: serialul certificatului + amprenta documentului.
    const signatureRef = `qes_${qes.serial.slice(0, 16)}_${documentHash.slice(0, 8)}`
    const certFields = {
      signatureRef,
      provider: qes.issuer,
      qes: true,
      documentHash,
      certificatePem: signature.certificatePem,
      certSubject: qes.subject,
      certIssuer: qes.issuer,
      certSerial: qes.serial,
      certNotAfter: qes.notAfter,
      signatureValue: signature.signatureValue,
      signatureAlgo: qes.algorithm,
      validationStatus: 'QUALIFIED',
    }

    const effectiveStart = contract.startDate ?? new Date()
    const firstDue = firstRentDueDate(effectiveStart, contract.dueDay)

    // Semnarea, pista de audit și activarea contractului rulează într-o singură tranzacție
    // cu un claim atomic pe flagul semnatarului curent: doar prima cerere care prinde flagul
    // pe `false` îl trece pe `true`. Astfel două semnături concurente nu se suprascriu reciproc
    // (nu mai există fereastra read→write care lăsa contractul blocat în SEMNAT) și efectele
    // de activare (plata inițială, schimbarea statusului proprietății) se aplică o singură dată.
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.contract.updateMany({
        where: {
          id: contractId,
          status: { in: ['IN_ASTEPTARE', 'SEMNAT'] },
          ...(isOwner ? { signedByOwner: false } : { signedByClient: false }),
        },
        data: { ...(isOwner ? { signedByOwner: true } : { signedByClient: true }), qes: true },
      })
      if (claimed.count === 0) return { stale: true as const }

      // Citim flagurile persistate în interiorul tranzacției pentru a decide activarea.
      const fresh = await tx.contract.findUniqueOrThrow({ where: { id: contractId } })
      const bothSigned = fresh.signedByOwner && fresh.signedByClient
      await tx.contract.update({
        where: { id: contractId },
        data: { status: bothSigned ? 'ACTIV' : 'SEMNAT' },
      })

      // Pistă de audit a semnăturii (cine, când, ce certificat, ce amprentă de document).
      await tx.signature.upsert({
        where: { contractId_signerId: { contractId: contract.id, signerId: user.id } },
        create: {
          contractId: contract.id,
          signerId: user.id,
          role: isOwner ? 'OWNER' : 'CLIENT',
          signerName,
          signerEmail: user.email,
          ...certFields,
        },
        update: { ...certFields, signedAt: new Date() },
      })

      if (bothSigned && contract.type === 'VANZARE') {
        // Antecontract semnat de ambele părți: avansul (arvuna) devine scadent.
        await tx.payment.create({
          data: {
            reference: paymentReference(),
            userId: contract.tenantId,
            contractId: contract.id,
            amount: contract.deposit,
            type: 'AVANS',
            status: 'IN_CURS',
          },
        })
      } else if (bothSigned) {
        // Contract activ: proprietatea devine închiriată și prima chirie devine scadentă.
        await tx.property.update({ where: { id: contract.propertyId }, data: { status: 'INCHIRIATA' } })
        await tx.payment.create({
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
      }

      return { stale: false as const, bothSigned }
    })

    if (result.stale) {
      return { ok: false as const, error: 'Ai semnat deja acest contract.' }
    }

    // Notificările sunt non-critice — rulează după ce tranzacția s-a încheiat.
    if (result.bothSigned && contract.type === 'VANZARE') {
      const message = `Antecontractul pentru „${contract.property.title}” este activ. Avansul de ${formatRon(contract.deposit)} este scadent.`
      await notify(contract.tenantId, 'Antecontract activ', message, 'success')
      await notify(contract.ownerId, 'Antecontract activ', message, 'success')
    } else if (result.bothSigned) {
      const dueLabel = firstDue.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
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
