import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createReviewAction } from '@/app/actions/reviews'
import { getUserReputation, canReview } from '@/lib/reviews'

async function contractIn(status: string) {
  const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
  const tenant = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({ data: { title: 'Ap', location: 'Buc', rent: 1500, ownerId: owner.id } })
  const contract = await prisma.contract.create({
    data: { propertyId: property.id, ownerId: owner.id, tenantId: tenant.id, type: 'INCHIRIERE', rent: 1500, months: 12, status },
  })
  return { owner, tenant, contract }
}

describe('reviews / reputation', () => {
  beforeEach(async () => { await resetDb() })

  it('permite o recenzie reciprocă pe un contract încheiat și actualizează reputația', async () => {
    const { owner, tenant, contract } = await contractIn('INCHEIAT')

    setUser(sessionFor(tenant))
    const res = await createReviewAction(contract.id, 5, 'Proprietar excelent.')
    expect(res.ok).toBe(true)

    const rep = await getUserReputation(owner.id)
    expect(rep.count).toBe(1)
    expect(rep.average).toBe(5)
    expect(await prisma.notification.count({ where: { userId: owner.id } })).toBe(1)
  })

  it('respinge a doua recenzie a aceluiași autor și notele invalide', async () => {
    const { tenant, contract } = await contractIn('INCHEIAT')
    setUser(sessionFor(tenant))
    await createReviewAction(contract.id, 4)
    expect((await createReviewAction(contract.id, 3)).ok).toBe(false) // deja recenzat
    expect((await createReviewAction(contract.id, 9)).ok).toBe(false) // notă invalidă (alt contract n-ar conta oricum)
  })

  it('nu permite recenzii pe un contract care nu e încheiat', async () => {
    const { tenant, contract } = await contractIn('ACTIV')
    setUser(sessionFor(tenant))
    expect((await createReviewAction(contract.id, 5)).ok).toBe(false)
  })

  it('un terț nu poate recenza', async () => {
    const { contract } = await contractIn('INCHEIAT')
    const stranger = await makeUser('CLIENT', `x-${Math.random()}@ex.ro`)
    setUser(sessionFor(stranger))
    const elig = await canReview(contract.id, stranger.id)
    expect(elig.ok).toBe(false)
    expect((await createReviewAction(contract.id, 5)).ok).toBe(false)
  })

  it('media reputației combină recenziile primite', async () => {
    const { owner, tenant, contract } = await contractIn('INCHEIAT')
    // a doua relație, alt chiriaș, ca să existe două recenzii pentru același proprietar
    const tenant2 = await makeUser('CLIENT', `t2-${Math.random()}@ex.ro`)
    const property2 = await prisma.property.create({ data: { title: 'Ap2', location: 'Buc', rent: 1500, ownerId: owner.id } })
    const contract2 = await prisma.contract.create({ data: { propertyId: property2.id, ownerId: owner.id, tenantId: tenant2.id, type: 'INCHIRIERE', rent: 1500, months: 12, status: 'INCHEIAT' } })

    setUser(sessionFor(tenant))
    await createReviewAction(contract.id, 4)
    setUser(sessionFor(tenant2))
    await createReviewAction(contract2.id, 2)

    const rep = await getUserReputation(owner.id)
    expect(rep.count).toBe(2)
    expect(rep.average).toBe(3) // (4+2)/2
  })
})
