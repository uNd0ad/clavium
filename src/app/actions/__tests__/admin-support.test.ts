import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import {
  adminSetKycStatusAction,
  adminModeratePropertyAction,
  adminRefundPaymentAction,
  adminVerifyAuditChainAction,
} from '@/app/actions/admin'

describe('admin support tooling', () => {
  beforeEach(async () => { await resetDb() })

  it('suprascrie starea KYC și aliniază User + KycVerification', async () => {
    const admin = await makeUser('ADMIN', `a-${Math.random()}@ex.ro`)
    const target = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
    setUser(sessionFor(admin))

    const res = await adminSetKycStatusAction(target.id, 'VERIFIED')
    expect(res.ok).toBe(true)
    expect((await prisma.user.findUniqueOrThrow({ where: { id: target.id } })).kycStatus).toBe('VERIFIED')
    expect((await prisma.kycVerification.findUniqueOrThrow({ where: { userId: target.id } })).status).toBe('VERIFIED')
    expect(await prisma.notification.count({ where: { userId: target.id } })).toBe(1)
  })

  it('respinge o stare KYC invalidă', async () => {
    const admin = await makeUser('ADMIN', `a-${Math.random()}@ex.ro`)
    const target = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
    setUser(sessionFor(admin))
    expect((await adminSetKycStatusAction(target.id, 'NOPE')).ok).toBe(false)
  })

  it('moderează o listare (ascunde / reactivează)', async () => {
    const admin = await makeUser('ADMIN', `a-${Math.random()}@ex.ro`)
    const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
    const property = await prisma.property.create({ data: { title: 'X', location: 'Buc', rent: 1000, ownerId: owner.id } })
    setUser(sessionFor(admin))

    expect((await adminModeratePropertyAction(property.id, 'hide')).ok).toBe(true)
    expect((await prisma.property.findUniqueOrThrow({ where: { id: property.id } })).status).toBe('INACTIVA')
    expect((await adminModeratePropertyAction(property.id, 'restore')).ok).toBe(true)
    expect((await prisma.property.findUniqueOrThrow({ where: { id: property.id } })).status).toBe('DISPONIBILA')
  })

  it('rambursează o plată finalizată o singură dată', async () => {
    const admin = await makeUser('ADMIN', `a-${Math.random()}@ex.ro`)
    const payer = await makeUser('CLIENT', `p-${Math.random()}@ex.ro`)
    const payment = await prisma.payment.create({ data: { reference: `r-${Math.random()}`, userId: payer.id, amount: 1500, type: 'CHIRIE', status: 'FINALIZATA', paidAt: new Date() } })
    setUser(sessionFor(admin))

    const first = await adminRefundPaymentAction(payment.id)
    expect(first.ok).toBe(true)
    const refund = await prisma.payment.findFirstOrThrow({ where: { type: 'REFUND' } })
    expect(refund.amount).toBe(1500)
    expect(refund.userId).toBe(payer.id)

    // A doua oară: refuzat (idempotent).
    expect((await adminRefundPaymentAction(payment.id)).ok).toBe(false)
  })

  it('verifică lanțul de audit', async () => {
    const admin = await makeUser('ADMIN', `a-${Math.random()}@ex.ro`)
    setUser(sessionFor(admin))
    const res = await adminVerifyAuditChainAction()
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.valid).toBe(true)
  })

  it('refuză un non-admin', async () => {
    const client = await makeUser('CLIENT', `c-${Math.random()}@ex.ro`)
    setUser(sessionFor(client))
    expect((await adminVerifyAuditChainAction()).ok).toBe(false)
  })
})
