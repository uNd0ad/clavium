import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { processDunning } from '@/lib/jobs'

const DAY = 86_400_000

async function setupContract() {
  const owner = await makeUser('OWNER', `own-${Date.now()}-${Math.random()}@ex.ro`)
  const tenant = await makeUser('CLIENT', `ten-${Date.now()}-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({
    data: { title: 'Apartament test', location: 'București', rent: 2000, ownerId: owner.id, status: 'INCHIRIATA' },
  })
  const contract = await prisma.contract.create({
    data: { propertyId: property.id, ownerId: owner.id, tenantId: tenant.id, type: 'INCHIRIERE', rent: 2000, months: 12, status: 'ACTIV' },
  })
  return { owner, tenant, contract }
}

describe('processDunning', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('notifică o chirie apropiată de scadență și una restantă, idempotent', async () => {
    const now = new Date()
    const { owner, tenant, contract } = await setupContract()

    const upcoming = await prisma.payment.create({
      data: { reference: `u-${Date.now()}`, userId: tenant.id, contractId: contract.id, amount: 2000, type: 'CHIRIE', status: 'IN_CURS', dueDate: new Date(now.getTime() + 2 * DAY) },
    })
    const overdue = await prisma.payment.create({
      data: { reference: `o-${Date.now()}`, userId: tenant.id, contractId: contract.id, amount: 2000, type: 'CHIRIE', status: 'IN_CURS', dueDate: new Date(now.getTime() - 5 * DAY) },
    })
    // Scadență departe în viitor → niciun memento.
    await prisma.payment.create({
      data: { reference: `f-${Date.now()}`, userId: tenant.id, contractId: contract.id, amount: 2000, type: 'CHIRIE', status: 'IN_CURS', dueDate: new Date(now.getTime() + 20 * DAY) },
    })

    const result = await processDunning(now)
    expect(result.remindersSent).toBe(1)
    expect(result.overdueSent).toBe(1)

    // Chiriaș: 1 memento (warning) + 1 restanță (danger). Proprietar: 1 întârziere (warning).
    expect(await prisma.notification.count({ where: { userId: tenant.id } })).toBe(2)
    expect(await prisma.notification.count({ where: { userId: owner.id } })).toBe(1)
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: upcoming.id } })).lastReminderAt).not.toBeNull()
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: overdue.id } })).lastReminderAt).not.toBeNull()

    // A doua rulare imediată: nimic nou (upcoming deja notificat; overdue în fereastra de repetare).
    const second = await processDunning(now)
    expect(second.remindersSent).toBe(0)
    expect(second.overdueSent).toBe(0)
    expect(await prisma.notification.count({ where: { userId: tenant.id } })).toBe(2)
  })

  it('re-notifică restanța după fereastra de repetare', async () => {
    const now = new Date()
    const { tenant, contract } = await setupContract()
    await prisma.payment.create({
      data: {
        reference: `o2-${Date.now()}`,
        userId: tenant.id,
        contractId: contract.id,
        amount: 2000,
        type: 'CHIRIE',
        status: 'IN_CURS',
        dueDate: new Date(now.getTime() - 10 * DAY),
        lastReminderAt: new Date(now.getTime() - 4 * DAY), // ultima notificare acum 4 zile (> 3)
      },
    })
    const result = await processDunning(now)
    expect(result.overdueSent).toBe(1)
  })
})
