import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { processAutopay } from '@/lib/autopay'

async function rentalWithDuePayment(opts: { autopay: boolean; status?: string }) {
  const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
  const tenant = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({ data: { title: 'Ap', location: 'Buc', rent: 1500, ownerId: owner.id } })
  const contract = await prisma.contract.create({
    data: {
      propertyId: property.id, ownerId: owner.id, tenantId: tenant.id, type: 'INCHIRIERE',
      rent: 1500, months: 12, status: opts.status ?? 'ACTIV', autopayEnabled: opts.autopay,
    },
  })
  const payment = await prisma.payment.create({
    data: {
      reference: `R-${Math.random().toString(36).slice(2)}`, userId: tenant.id, contractId: contract.id,
      amount: 1500, type: 'CHIRIE', status: 'IN_CURS', dueDate: new Date(Date.now() - 86_400_000),
    },
  })
  return { owner, tenant, contract, payment }
}

describe('processAutopay (mod dev: decontare directă)', () => {
  beforeEach(async () => { await resetDb() })

  it('încasează automat chiria scadentă a contractelor cu autopay activ', async () => {
    const { tenant, owner, payment } = await rentalWithDuePayment({ autopay: true })

    const res = await processAutopay()
    expect(res.charged).toBe(1)

    const settled = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })
    expect(settled.status).toBe('FINALIZATA')
    expect(settled.paidAt).not.toBeNull()
    // notificări către chiriaș și proprietar
    expect(await prisma.notification.count({ where: { userId: tenant.id, title: 'Chirie plătită automat' } })).toBe(1)
    expect(await prisma.notification.count({ where: { userId: owner.id } })).toBeGreaterThanOrEqual(1)
  })

  it('nu atinge contractele fără autopay', async () => {
    const { payment } = await rentalWithDuePayment({ autopay: false })
    const res = await processAutopay()
    expect(res.charged).toBe(0)
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe('IN_CURS')
  })

  it('nu încasează pe contracte care nu sunt active', async () => {
    await rentalWithDuePayment({ autopay: true, status: 'INCHEIAT' })
    expect((await processAutopay()).charged).toBe(0)
  })

  it('e idempotent — a doua rulare nu mai încasează nimic', async () => {
    await rentalWithDuePayment({ autopay: true })
    expect((await processAutopay()).charged).toBe(1)
    // a doua rulare: plata inițială e deja FINALIZATA; eventuala scadență nouă e în viitor
    expect((await processAutopay()).charged).toBe(0)
  })
})
