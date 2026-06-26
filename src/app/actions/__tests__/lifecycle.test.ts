import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createPropertyAction } from '@/app/actions/properties'
import { createOfferAction, respondToOfferAction } from '@/app/actions/offers'
import { payRentAction } from '@/app/actions/contracts'
import { signContractAs } from '@/test/qesSign'

type DbUser = Awaited<ReturnType<typeof makeUser>>

describe('flux complet: proprietate → ofertă → contract → semnare → plată', () => {
  let owner: DbUser
  let client: DbUser

  beforeAll(async () => {
    await resetDb()
    owner = await makeUser('OWNER', 'owner@lifecycle.test')
    client = await makeUser('CLIENT', 'client@lifecycle.test')
  })

  it('parcurge tot ciclul de viață prin server actions', async () => {
    // 1. Owner creează o proprietate.
    setUser(sessionFor(owner))
    const created = await createPropertyAction({ title: 'Apartament de test', location: 'București', rent: 1500 })
    expect(created.ok).toBe(true)
    const propertyId = created.ok ? created.propertyId : ''
    expect(await prisma.property.count()).toBe(1)

    // 2. Clientul trimite o ofertă; ownerul este notificat.
    setUser(sessionFor(client))
    const offered = await createOfferAction({ propertyId, amount: 1400 })
    expect(offered.ok).toBe(true)
    const offer = await prisma.offer.findFirstOrThrow()
    expect(offer.status).toBe('TRIMISA')
    expect(await prisma.notification.count({ where: { userId: owner.id } })).toBeGreaterThan(0)

    // 3. Ownerul acceptă → se creează contractul cu chiria din ofertă.
    setUser(sessionFor(owner))
    const accepted = await respondToOfferAction(offer.id, 'accept')
    expect(accepted.ok).toBe(true)
    const contract = await prisma.contract.findFirstOrThrow()
    expect(contract.status).toBe('IN_ASTEPTARE')
    expect(contract.rent).toBe(1400)

    // 4. Ownerul semnează (→ SEMNAT), apoi clientul semnează (→ ACTIV).
    expect((await signContractAs(contract.id)).ok).toBe(true)
    expect((await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })).status).toBe('SEMNAT')

    setUser(sessionFor(client))
    expect((await signContractAs(contract.id)).ok).toBe(true)
    const active = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })
    expect(active.status).toBe('ACTIV')

    // Proprietatea devine închiriată; prima chirie devine scadentă.
    expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe('INCHIRIATA')
    const due = await prisma.payment.findFirstOrThrow({ where: { type: 'CHIRIE', status: 'IN_CURS' } })
    expect(due.amount).toBe(1400)

    // 5. Clientul plătește chiria → FINALIZATA + comision pentru owner + următoarea scadență.
    const paid = await payRentAction(contract.id)
    expect(paid.ok).toBe(true)
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: due.id } })).status).toBe('FINALIZATA')
    expect(await prisma.payment.count({ where: { type: 'COMISION', status: 'FINALIZATA' } })).toBe(1)
    expect(await prisma.payment.count({ where: { type: 'CHIRIE', status: 'IN_CURS' } })).toBe(1)
  })
})
