import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { getReceiptData } from '@/lib/receipts'
import { buildReceiptPdf } from '@/lib/receiptPdf'

async function paidRent(status = 'FINALIZATA') {
  const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
  const tenant = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({ data: { title: 'Apartament Central', location: 'Cluj', rent: 1500, ownerId: owner.id } })
  const contract = await prisma.contract.create({
    data: { propertyId: property.id, ownerId: owner.id, tenantId: tenant.id, type: 'INCHIRIERE', rent: 1500, months: 12, status: 'ACTIV' },
  })
  const payment = await prisma.payment.create({
    data: { reference: `TRX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, userId: tenant.id, contractId: contract.id, amount: 1500, type: 'CHIRIE', status, paidAt: status === 'FINALIZATA' ? new Date() : null },
  })
  return { owner, tenant, contract, payment }
}

describe('receipts', () => {
  beforeEach(async () => { await resetDb() })

  it('produce datele chitanței pentru plătitor și proprietar, dar nu pentru un terț', async () => {
    const { owner, tenant, payment } = await paidRent()
    const stranger = await makeUser('CLIENT', `x-${Math.random()}@ex.ro`)

    const forPayer = await getReceiptData(payment.id, sessionFor(tenant))
    expect(forPayer).not.toBeNull()
    expect(forPayer).toMatchObject({ reference: payment.reference, typeLabel: 'Chirie', propertyTitle: 'Apartament Central', isInvoice: false })

    expect(await getReceiptData(payment.id, sessionFor(owner))).not.toBeNull()
    expect(await getReceiptData(payment.id, sessionFor(stranger))).toBeNull()
  })

  it('nu emite chitanță pentru o plată ne-finalizată', async () => {
    const { tenant, payment } = await paidRent('IN_CURS')
    expect(await getReceiptData(payment.id, sessionFor(tenant))).toBeNull()
  })

  it('comisionul este marcat ca factură', async () => {
    const { owner, contract } = await paidRent()
    const fee = await prisma.payment.create({
      data: { reference: `COM-${Math.random().toString(36).slice(2, 8)}`, userId: owner.id, contractId: contract.id, amount: 75, type: 'COMISION', status: 'FINALIZATA', paidAt: new Date() },
    })
    const data = await getReceiptData(fee.id, sessionFor(owner))
    expect(data?.isInvoice).toBe(true)
  })

  it('buildReceiptPdf generează un PDF valid', async () => {
    const { tenant, payment } = await paidRent()
    const data = await getReceiptData(payment.id, sessionFor(tenant))
    expect(data).not.toBeNull()
    const bytes = await buildReceiptPdf(data!)
    expect(bytes.length).toBeGreaterThan(800)
    // Semnătura fișierului PDF.
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-')
  })
})
