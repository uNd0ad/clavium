'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { adminUserUpdateSchema } from '@/lib/validations'
import { revokeAllSessions } from '@/lib/auth'
import { notify } from '@/lib/notify'
import { paymentReference } from '@/lib/hash'
import { recordAuditSafe, verifyAuditChain } from '@/lib/audit'

export async function updateUserAction(targetId: string, input: unknown) {
  try {
    const user = await requireActionUser(['ADMIN'])
    if (targetId === user.id) {
      return { ok: false as const, error: 'Nu îți poți modifica propriul cont de aici.' }
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } })
    if (!target) return { ok: false as const, error: 'Utilizatorul nu există.' }

    const data = adminUserUpdateSchema.parse(input)
    await prisma.user.update({
      where: { id: targetId },
      data: {
        ...(data.role ? { role: data.role } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    })

    // Schimbarea rolului sau dezactivarea invalidează sesiunile utilizatorului vizat.
    if (data.role || data.isActive === false) {
      await revokeAllSessions(targetId)
    }

    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

const KYC_STATUSES = ['VERIFIED', 'REJECTED', 'PENDING', 'UNVERIFIED'] as const
type KycStatus = (typeof KYC_STATUSES)[number]

// Suprascriere manuală a stării KYC (suport): aliniază User.kycStatus și dosarul KycVerification.
export async function adminSetKycStatusAction(targetId: string, status: string, reason?: string) {
  try {
    const admin = await requireActionUser(['ADMIN'])
    if (!KYC_STATUSES.includes(status as KycStatus)) return { ok: false as const, error: 'Stare KYC invalidă.' }
    const target = await prisma.user.findUnique({ where: { id: targetId } })
    if (!target) return { ok: false as const, error: 'Utilizatorul nu există.' }

    const verifiedAt = status === 'VERIFIED' ? new Date() : null
    await prisma.$transaction([
      prisma.user.update({ where: { id: targetId }, data: { kycStatus: status } }),
      prisma.kycVerification.upsert({
        where: { userId: targetId },
        create: { userId: targetId, status, provider: 'admin', reference: `admin_${admin.id.slice(0, 8)}`, rejectionReason: reason ?? null, verifiedAt },
        update: { status, provider: 'admin', rejectionReason: reason ?? null, verifiedAt },
      }),
    ])
    await notify(
      targetId,
      'Stare verificare actualizată',
      status === 'VERIFIED' ? 'Identitatea ta a fost verificată de un administrator.' : `Starea verificării tale a fost actualizată: ${status}.`,
      status === 'VERIFIED' ? 'success' : 'warning'
    )
    await recordAuditSafe({ actorId: admin.id, action: 'KYC_OVERRIDE', entityType: 'USER', entityId: targetId, metadata: { status, reason: reason ?? null } })
    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Moderarea unei listări: ascundere (INACTIVA) sau reactivare (DISPONIBILA).
export async function adminModeratePropertyAction(propertyId: string, action: 'hide' | 'restore') {
  try {
    const admin = await requireActionUser(['ADMIN'])
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) return { ok: false as const, error: 'Listarea nu există.' }

    const status = action === 'hide' ? 'INACTIVA' : 'DISPONIBILA'
    await prisma.property.update({ where: { id: propertyId }, data: { status } })
    await notify(
      property.ownerId,
      action === 'hide' ? 'Listare ascunsă' : 'Listare reactivată',
      action === 'hide'
        ? `Listarea „${property.title}” a fost ascunsă de un administrator.`
        : `Listarea „${property.title}” a fost reactivată.`,
      action === 'hide' ? 'warning' : 'info'
    )
    await recordAuditSafe({ actorId: admin.id, action: 'PROPERTY_MODERATED', entityType: 'PROPERTY', entityId: propertyId, metadata: { action, status } })
    revalidatePath('/dashboard', 'layout')
    revalidatePath('/proprietati', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Rambursarea manuală a unei plăți finalizate (suport): creează un REFUND către plătitor.
export async function adminRefundPaymentAction(paymentId: string) {
  try {
    const admin = await requireActionUser(['ADMIN'])
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) return { ok: false as const, error: 'Plata nu există.' }
    if (payment.status !== 'FINALIZATA') return { ok: false as const, error: 'Doar o plată finalizată poate fi rambursată.' }
    if (payment.type === 'REFUND' || payment.type === 'COMISION') return { ok: false as const, error: 'Acest tip de plată nu poate fi rambursat.' }

    // Idempotent: nu dubla rambursarea aceleiași plăți.
    const existing = await prisma.payment.findFirst({ where: { contractId: payment.contractId, type: 'REFUND', amount: payment.amount, userId: payment.userId } })
    if (existing) return { ok: false as const, error: 'Plata pare deja rambursată.' }

    await prisma.payment.create({
      data: { reference: paymentReference(), userId: payment.userId, contractId: payment.contractId, amount: payment.amount, type: 'REFUND', status: 'FINALIZATA', paidAt: new Date() },
    })
    await notify(payment.userId, 'Rambursare efectuată', `Ți-a fost rambursată suma aferentă tranzacției ${payment.reference}.`, 'success')
    await recordAuditSafe({ actorId: admin.id, action: 'PAYMENT_REFUNDED', entityType: 'PAYMENT', entityId: paymentId, metadata: { amount: payment.amount, reference: payment.reference } })
    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Verifică integritatea lanțului de audit (tamper-evidence) — pentru panoul de administrare.
export async function adminVerifyAuditChainAction() {
  try {
    await requireActionUser(['ADMIN'])
    const result = await verifyAuditChain()
    return { ok: true as const, valid: result.ok, count: result.count, brokenAtSeq: result.brokenAtSeq }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
