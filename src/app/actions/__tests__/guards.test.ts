import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createPropertyAction, toggleSaveAction } from '@/app/actions/properties'
import { createOfferAction, respondToOfferAction } from '@/app/actions/offers'
import { payRentAction } from '@/app/actions/contracts'
import { signContractAs } from '@/test/qesSign'
import { updateUserAction } from '@/app/actions/admin'

type DbUser = Awaited<ReturnType<typeof makeUser>>

describe('paznici de autentificare și roluri', () => {
  let owner: DbUser
  let client: DbUser
  let other: DbUser
  let admin: DbUser
  let propertyId: string

  beforeAll(async () => {
    await resetDb()
    owner = await makeUser('OWNER', 'owner@guards.test')
    client = await makeUser('CLIENT', 'client@guards.test')
    other = await makeUser('CLIENT', 'other@guards.test')
    admin = await makeUser('ADMIN', 'admin@guards.test')
    setUser(sessionFor(owner))
    const created = await createPropertyAction({ title: 'Garsonieră de test', location: 'Cluj', rent: 1000 })
    propertyId = created.ok ? created.propertyId : ''
  })

  beforeEach(() => setUser(null))

  it('refuză acțiunile neautentificate', async () => {
    const res = await toggleSaveAction(propertyId)
    expect(res).toEqual({ ok: false, error: 'Neautentificat.' })
  })

  it('refuză crearea de proprietăți de către un client (rol greșit)', async () => {
    setUser(sessionFor(client))
    const res = await createPropertyAction({ title: 'Casă de test', location: 'Iași', rent: 2000 })
    expect(res.ok).toBe(false)
  })

  it('refuză oferta proprietarului pe propria proprietate', async () => {
    setUser(sessionFor(owner))
    const res = await createOfferAction({ propertyId, amount: 900 })
    expect(res.ok).toBe(false)
  })

  it('refuză a doua ofertă în așteptare de la același client', async () => {
    setUser(sessionFor(client))
    expect((await createOfferAction({ propertyId, amount: 950 })).ok).toBe(true)
    const second = await createOfferAction({ propertyId, amount: 980 })
    expect(second.ok).toBe(false)
  })

  it('refuză răspunsul la ofertă de la un utilizator care nu e destinatar', async () => {
    const offer = await prisma.offer.findFirstOrThrow({ where: { status: 'TRIMISA' } })
    setUser(sessionFor(other))
    const res = await respondToOfferAction(offer.id, 'accept')
    expect(res.ok).toBe(false)
  })

  it('refuză semnarea de către cineva care nu e parte în contract', async () => {
    const offer = await prisma.offer.findFirstOrThrow({ where: { status: 'TRIMISA' } })
    setUser(sessionFor(owner))
    await respondToOfferAction(offer.id, 'accept')
    const contract = await prisma.contract.findFirstOrThrow()
    setUser(sessionFor(other))
    const res = await signContractAs(contract.id)
    expect(res.ok).toBe(false)
  })

  it('refuză plata chiriei pe un contract care nu e activ', async () => {
    const contract = await prisma.contract.findFirstOrThrow()
    setUser(sessionFor(client))
    const res = await payRentAction(contract.id)
    expect(res.ok).toBe(false)
  })

  it('refuză acțiunile de admin pentru non-admin și pe propriul cont', async () => {
    setUser(sessionFor(client))
    expect((await updateUserAction(other.id, { role: 'OWNER' })).ok).toBe(false)
    setUser(sessionFor(admin))
    expect((await updateUserAction(admin.id, { role: 'OWNER' })).ok).toBe(false)
    expect((await updateUserAction(other.id, { role: 'OWNER' })).ok).toBe(true)
  })
})
