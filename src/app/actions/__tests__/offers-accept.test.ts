import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createPropertyAction } from '@/app/actions/properties'
import { createOfferAction, respondToOfferAction } from '@/app/actions/offers'

type DbUser = Awaited<ReturnType<typeof makeUser>>

describe('acceptare ofertă — un singur contract per proprietate', () => {
  let owner: DbUser
  let client: DbUser
  let propertyId: string

  beforeAll(async () => {
    await resetDb()
    owner = await makeUser('OWNER', 'owner@accept.test')
    client = await makeUser('CLIENT', 'client@accept.test')
    setUser(sessionFor(owner))
    const created = await createPropertyAction({ title: 'Apartament de test', location: 'Brașov', rent: 1200 })
    propertyId = created.ok ? created.propertyId : ''
  })

  it('marchează proprietatea ca închiriată la acceptare', async () => {
    setUser(sessionFor(client))
    await createOfferAction({ propertyId, amount: 1100 })
    const offer = await prisma.offer.findFirstOrThrow({ where: { status: 'TRIMISA' } })

    setUser(sessionFor(owner))
    expect((await respondToOfferAction(offer.id, 'accept')).ok).toBe(true)

    expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe('INCHIRIATA')
  })

  it('refuză acceptarea când proprietatea nu mai e disponibilă', async () => {
    await prisma.offer.create({
      data: {
        propertyId,
        fromUserId: client.id,
        toUserId: owner.id,
        amount: 1050,
        status: 'TRIMISA',
      },
    })
    const offer = await prisma.offer.findFirstOrThrow({ where: { propertyId, status: 'TRIMISA' } })

    setUser(sessionFor(owner))
    const res = await respondToOfferAction(offer.id, 'accept')
    expect(res.ok).toBe(false)
    expect(res.error).toBe('Proprietatea nu este disponibilă.')
    expect(await prisma.contract.count()).toBe(1)
  })

  it('refuză acceptarea când există un contract deschis pe o proprietate disponibilă', async () => {
    setUser(sessionFor(owner))
    const second = await createPropertyAction({ title: 'Garsonieră de test', location: 'Sibiu', rent: 900 })
    const secondPropertyId = second.ok ? second.propertyId : ''

    await prisma.contract.create({
      data: {
        propertyId: secondPropertyId,
        ownerId: owner.id,
        tenantId: client.id,
        rent: 900,
        status: 'IN_ASTEPTARE',
      },
    })

    setUser(sessionFor(client))
    await createOfferAction({ propertyId: secondPropertyId, amount: 850 })
    const offer = await prisma.offer.findFirstOrThrow({
      where: { propertyId: secondPropertyId, status: 'TRIMISA' },
    })

    setUser(sessionFor(owner))
    const res = await respondToOfferAction(offer.id, 'accept')
    expect(res.ok).toBe(false)
    expect(res.error).toBe('Există deja un contract în curs pentru această proprietate.')
    expect(await prisma.contract.count({ where: { propertyId: secondPropertyId } })).toBe(1)
  })
})
