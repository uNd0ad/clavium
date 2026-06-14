import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createPropertyAction, toggleSaveAction, updatePropertyStatusAction, updatePropertyAction } from '@/app/actions/properties'
import { createOfferAction, respondToOfferAction } from '@/app/actions/offers'

type DbUser = Awaited<ReturnType<typeof makeUser>>

describe('operații pe proprietăți și oferte', () => {
  let owner: DbUser
  let otherOwner: DbUser
  let client: DbUser
  let propertyId: string

  beforeAll(async () => {
    await resetDb()
    owner = await makeUser('OWNER', 'owner@ops.test')
    otherOwner = await makeUser('OWNER', 'other-owner@ops.test')
    client = await makeUser('CLIENT', 'client@ops.test')
    setUser(sessionFor(owner))
    const created = await createPropertyAction({ title: 'Loft de test', location: 'Brașov', rent: 1800 })
    propertyId = created.ok ? created.propertyId : ''
  })

  it('salvarea proprietății comută corect (save → unsave)', async () => {
    setUser(sessionFor(client))
    const first = await toggleSaveAction(propertyId)
    expect(first).toMatchObject({ ok: true, saved: true })
    expect(await prisma.savedProperty.count({ where: { userId: client.id } })).toBe(1)

    const second = await toggleSaveAction(propertyId)
    expect(second).toMatchObject({ ok: true, saved: false })
    expect(await prisma.savedProperty.count({ where: { userId: client.id } })).toBe(0)
  })

  it('doar proprietarul își poate edita detaliile, cu validare', async () => {
    // Alt proprietar nu are voie.
    setUser(sessionFor(otherOwner))
    expect((await updatePropertyAction(propertyId, { rent: 2000 })).ok).toBe(false)

    // Proprietarul poate edita; valorile se actualizează.
    setUser(sessionFor(owner))
    const ok = await updatePropertyAction(propertyId, { title: 'Loft renovat de test', rent: 2100, rooms: 3 })
    expect(ok.ok).toBe(true)
    const updated = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })
    expect(updated.title).toBe('Loft renovat de test')
    expect(updated.rent).toBe(2100)
    expect(updated.rooms).toBe(3)

    // Validarea respinge valori invalide (titlu prea scurt).
    expect((await updatePropertyAction(propertyId, { title: 'ab' })).ok).toBe(false)
  })

  it('doar proprietarul își poate dezactiva/reactiva listarea', async () => {
    // Alt proprietar nu are voie.
    setUser(sessionFor(otherOwner))
    expect((await updatePropertyStatusAction(propertyId, 'INACTIVA')).ok).toBe(false)

    // Proprietarul poate.
    setUser(sessionFor(owner))
    expect((await updatePropertyStatusAction(propertyId, 'INACTIVA')).ok).toBe(true)
    expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe('INACTIVA')
    expect((await updatePropertyStatusAction(propertyId, 'DISPONIBILA')).ok).toBe(true)
    expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe('DISPONIBILA')
  })

  it('respingerea unei oferte o marchează RESPINSA și notifică clientul, fără contract', async () => {
    setUser(sessionFor(client))
    const offered = await createOfferAction({ propertyId, amount: 1700 })
    expect(offered.ok).toBe(true)
    const offer = await prisma.offer.findFirstOrThrow({ where: { status: 'TRIMISA' } })

    setUser(sessionFor(owner))
    const rejected = await respondToOfferAction(offer.id, 'reject')
    expect(rejected).toMatchObject({ ok: true, status: 'RESPINSA' })
    expect((await prisma.offer.findUniqueOrThrow({ where: { id: offer.id } })).status).toBe('RESPINSA')
    expect(await prisma.contract.count()).toBe(0)
    expect(await prisma.notification.count({ where: { userId: client.id } })).toBeGreaterThan(0)
  })
})
