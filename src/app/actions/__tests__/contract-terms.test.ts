import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createPropertyAction } from '@/app/actions/properties'
import { createOfferAction, respondToOfferAction } from '@/app/actions/offers'
import { setContractTermsAction, signContractAction } from '@/app/actions/contracts'

type DbUser = Awaited<ReturnType<typeof makeUser>>

describe('termenii contractului (generator)', () => {
  let owner: DbUser
  let client: DbUser
  let contractId: string

  beforeAll(async () => {
    await resetDb()
    owner = await makeUser('OWNER', 'owner@terms.test')
    client = await makeUser('CLIENT', 'client@terms.test')
    setUser(sessionFor(owner))
    const created = await createPropertyAction({ title: 'Apartament termeni', location: 'București', rent: 1500 })
    const propertyId = created.ok ? created.propertyId : ''
    setUser(sessionFor(client))
    await createOfferAction({ propertyId, amount: 1500 })
    const offer = await prisma.offer.findFirstOrThrow()
    setUser(sessionFor(owner))
    await respondToOfferAction(offer.id, 'accept')
    contractId = (await prisma.contract.findFirstOrThrow()).id
  })

  it('contractul se creează cu termeni impliciți (garanție, scadență, date)', async () => {
    const c = await prisma.contract.findUniqueOrThrow({ where: { id: contractId } })
    expect(c.deposit).toBe(1500) // o chirie
    expect(c.dueDay).toBe(5)
    expect(c.startDate).toBeTruthy()
    expect(c.endDate).toBeTruthy()
  })

  it('proprietarul editează termenii și endDate se recalculează', async () => {
    setUser(sessionFor(owner))
    const res = await setContractTermsAction(contractId, {
      rent: 1600, deposit: 3200, months: 24, dueDay: 10, startDate: '2026-01-01', clauses: 'Fără animale de companie.',
    })
    expect(res.ok).toBe(true)
    const c = await prisma.contract.findUniqueOrThrow({ where: { id: contractId } })
    expect(c.rent).toBe(1600)
    expect(c.deposit).toBe(3200)
    expect(c.months).toBe(24)
    expect(c.dueDay).toBe(10)
    expect(c.clauses).toBe('Fără animale de companie.')
    expect(c.endDate?.getFullYear()).toBe(2028) // 2026-01 + 24 luni
  })

  it('clientul nu poate edita termenii', async () => {
    setUser(sessionFor(client))
    const res = await setContractTermsAction(contractId, { rent: 1, deposit: 0, months: 1, dueDay: 1, startDate: '2026-01-01' })
    expect(res.ok).toBe(false)
  })

  it('termenii se blochează după ce începe semnarea', async () => {
    setUser(sessionFor(owner))
    expect((await signContractAction(contractId)).ok).toBe(true) // → SEMNAT
    const res = await setContractTermsAction(contractId, { rent: 1, deposit: 0, months: 1, dueDay: 1, startDate: '2026-01-01' })
    expect(res.ok).toBe(false)
  })
})
