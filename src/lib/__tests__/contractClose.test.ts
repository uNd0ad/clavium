import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { returnRentalDeposit, cancelSaleContract, terminateRentalContract, renewRentalContract } from '@/lib/contractClose'

async function rental({ deposit = 5000, status = 'INCHEIAT', propertyStatus = 'INCHIRIATA' } = {}) {
  const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
  const tenant = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({ data: { title: 'Ap', location: 'Buc', rent: 2000, ownerId: owner.id, status: propertyStatus } })
  const contract = await prisma.contract.create({
    data: { propertyId: property.id, ownerId: owner.id, tenantId: tenant.id, type: 'INCHIRIERE', rent: 2000, deposit, months: 12, status },
  })
  return { owner, tenant, property, contract }
}

async function sale({ deposit = 20000, price = 200000, arvunaPaid = true, status = 'ACTIV' } = {}) {
  const owner = await makeUser('OWNER', `so-${Math.random()}@ex.ro`)
  const buyer = await makeUser('CLIENT', `sb-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({ data: { title: 'Casă', location: 'Buc', price, transactionType: 'VANZARE', ownerId: owner.id, status: 'REZERVATA' } })
  const contract = await prisma.contract.create({
    data: { propertyId: property.id, ownerId: owner.id, tenantId: buyer.id, type: 'VANZARE', price, deposit, months: 0, status },
  })
  if (arvunaPaid) {
    await prisma.payment.create({ data: { reference: `av-${Math.random()}`, userId: buyer.id, contractId: contract.id, amount: deposit, type: 'AVANS', status: 'FINALIZATA', paidAt: new Date() } })
  }
  return { owner, buyer, property, contract }
}

describe('returnRentalDeposit', () => {
  beforeEach(async () => { await resetDb() })

  it('restituie integral garanția când nu sunt rețineri', async () => {
    const { owner, tenant, contract } = await rental({ deposit: 5000 })
    const res = await returnRentalDeposit(contract.id, sessionFor(owner), { deduction: 0 })
    expect(res.ok).toBe(true)
    const refund = await prisma.payment.findFirstOrThrow({ where: { type: 'REFUND' } })
    expect(refund.amount).toBe(5000)
    expect(refund.userId).toBe(tenant.id)
    expect((await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })).depositStatus).toBe('RETURNED')
  })

  it('reține parțial pentru daune', async () => {
    const { owner, contract } = await rental({ deposit: 5000 })
    const res = await returnRentalDeposit(contract.id, sessionFor(owner), { deduction: 1500, reason: 'parchet deteriorat' })
    expect(res.ok).toBe(true)
    expect((await prisma.payment.findFirstOrThrow({ where: { type: 'REFUND' } })).amount).toBe(3500)
    expect((await prisma.payment.findFirstOrThrow({ where: { type: 'DAUNE' } })).userId).toBe(owner.id)
    expect((await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })).depositStatus).toBe('PARTIAL')
  })

  it('refuză a doua procesare (idempotent)', async () => {
    const { owner, contract } = await rental({ deposit: 5000 })
    await returnRentalDeposit(contract.id, sessionFor(owner), { deduction: 0 })
    const res = await returnRentalDeposit(contract.id, sessionFor(owner), { deduction: 0 })
    expect(res.ok).toBe(false)
  })

  it('refuză reținerea mai mare decât garanția și un contract neîncheiat', async () => {
    const { owner, contract } = await rental({ deposit: 5000 })
    expect((await returnRentalDeposit(contract.id, sessionFor(owner), { deduction: 9999 })).ok).toBe(false)
    const active = await rental({ status: 'ACTIV' })
    expect((await returnRentalDeposit(active.contract.id, sessionFor(active.owner), { deduction: 0 })).ok).toBe(false)
  })

  it('refuză un utilizator fără drept', async () => {
    const { tenant, contract } = await rental()
    expect((await returnRentalDeposit(contract.id, sessionFor(tenant), { deduction: 0 })).ok).toBe(false)
  })
})

describe('cancelSaleContract', () => {
  beforeEach(async () => { await resetDb() })

  it('cumpărătorul se retrage → pierde arvuna', async () => {
    const { owner, buyer, contract, property } = await sale({ deposit: 20000 })
    const res = await cancelSaleContract(contract.id, sessionFor(buyer), {})
    expect(res.ok).toBe(true)
    expect(await prisma.payment.count({ where: { type: 'REFUND' } })).toBe(0)
    const fresh = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })
    expect(fresh.status).toBe('ANULAT')
    expect(fresh.depositStatus).toBe('FORFEITED')
    expect((await prisma.property.findUniqueOrThrow({ where: { id: property.id } })).status).toBe('DISPONIBILA')
    void owner
  })

  it('vânzătorul se retrage → restituie dublul arvunei', async () => {
    const { owner, buyer, contract } = await sale({ deposit: 20000 })
    const res = await cancelSaleContract(contract.id, sessionFor(owner), {})
    expect(res.ok).toBe(true)
    const refund = await prisma.payment.findFirstOrThrow({ where: { type: 'REFUND' } })
    expect(refund.amount).toBe(40000)
    expect(refund.userId).toBe(buyer.id)
    expect((await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })).depositStatus).toBe('RETURNED')
  })

  it('fără arvună plătită → anulare simplă, fără mișcări de bani', async () => {
    const { owner, contract } = await sale({ arvunaPaid: false })
    const res = await cancelSaleContract(contract.id, sessionFor(owner), {})
    expect(res.ok).toBe(true)
    expect(await prisma.payment.count({ where: { type: 'REFUND' } })).toBe(0)
  })

  it('admin → restituire simplă a arvunei', async () => {
    const { buyer, contract } = await sale({ deposit: 20000 })
    const admin = await makeUser('ADMIN', `adm-${Math.random()}@ex.ro`)
    const res = await cancelSaleContract(contract.id, sessionFor(admin), { reason: 'litigiu' })
    expect(res.ok).toBe(true)
    expect((await prisma.payment.findFirstOrThrow({ where: { type: 'REFUND' } })).amount).toBe(20000)
    void buyer
  })

  it('anulează tranșele neachitate și respinge un contract finalizat', async () => {
    const { owner, contract } = await sale({ status: 'ACTIV' })
    await prisma.payment.create({ data: { reference: `r-${Math.random()}`, userId: contract.tenantId, contractId: contract.id, amount: 180000, type: 'REST', status: 'IN_CURS' } })
    await cancelSaleContract(contract.id, sessionFor(owner), {})
    expect((await prisma.payment.findFirstOrThrow({ where: { type: 'REST' } })).status).toBe('ESUATA')

    const done = await sale({ status: 'INCHEIAT' })
    expect((await cancelSaleContract(done.contract.id, sessionFor(done.owner), {})).ok).toBe(false)
  })
})

describe('terminateRentalContract', () => {
  beforeEach(async () => { await resetDb() })

  it('reziliază o închiriere activă: anulează chiria, încheie contractul, eliberează listarea', async () => {
    const { owner, tenant, property, contract } = await rental({ status: 'ACTIV', propertyStatus: 'INCHIRIATA' })
    await prisma.payment.create({ data: { reference: `c-${Math.random()}`, userId: tenant.id, contractId: contract.id, amount: 2000, type: 'CHIRIE', status: 'IN_CURS', dueDate: new Date() } })

    const res = await terminateRentalContract(contract.id, sessionFor(tenant), { reason: 'mutare' })
    expect(res.ok).toBe(true)
    const fresh = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })
    expect(fresh.status).toBe('INCHEIAT')
    expect(fresh.cancelledAt).not.toBeNull()
    expect(fresh.depositStatus).toBe('HELD') // garanția rămâne de restituit
    expect((await prisma.payment.findFirstOrThrow({ where: { type: 'CHIRIE' } })).status).toBe('ESUATA')
    expect((await prisma.property.findUniqueOrThrow({ where: { id: property.id } })).status).toBe('DISPONIBILA')
    void owner
  })

  it('refuză rezilierea unui contract care nu e activ', async () => {
    const { owner, contract } = await rental({ status: 'INCHEIAT' })
    expect((await terminateRentalContract(contract.id, sessionFor(owner), {})).ok).toBe(false)
  })
})

describe('renewRentalContract', () => {
  beforeEach(async () => { await resetDb() })

  it('creează un contract nou IN_ASTEPTARE și rezervă listarea disponibilă', async () => {
    const { owner, tenant, property, contract } = await rental({ status: 'INCHEIAT', propertyStatus: 'DISPONIBILA' })
    const res = await renewRentalContract(contract.id, sessionFor(owner), { months: 6, rent: 2200 })
    expect(res.ok).toBe(true)
    expect(res.contractId).toBeTruthy()
    const renewal = await prisma.contract.findUniqueOrThrow({ where: { id: res.contractId! } })
    expect(renewal.status).toBe('IN_ASTEPTARE')
    expect(renewal.months).toBe(6)
    expect(renewal.rent).toBe(2200)
    expect(renewal.tenantId).toBe(tenant.id)
    expect(renewal.signedByOwner).toBe(false)
    expect((await prisma.property.findUniqueOrThrow({ where: { id: property.id } })).status).toBe('REZERVATA')
  })

  it('refuză reînnoirea dacă listarea nu e disponibilă', async () => {
    const { owner, contract } = await rental({ status: 'INCHEIAT', propertyStatus: 'INCHIRIATA' })
    expect((await renewRentalContract(contract.id, sessionFor(owner), { months: 6 })).ok).toBe(false)
  })

  it('refuză reînnoirea de către chiriaș', async () => {
    const { tenant, contract } = await rental({ status: 'INCHEIAT', propertyStatus: 'DISPONIBILA' })
    expect((await renewRentalContract(contract.id, sessionFor(tenant), {})).ok).toBe(false)
  })
})
