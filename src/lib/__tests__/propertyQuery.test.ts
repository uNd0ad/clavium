import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { searchAvailableProperties } from '@/lib/propertyQuery'

describe('searchAvailableProperties — filtrare conștientă de preț', () => {
  beforeAll(async () => {
    await resetDb()
    const owner = await makeUser('OWNER', 'owner@search.test')
    await prisma.property.createMany({
      data: [
        { title: 'Apartament închiriere', location: 'București', transactionType: 'INCHIRIERE', rent: 2000, price: 0, ownerId: owner.id },
        { title: 'Garsonieră închiriere', location: 'București', transactionType: 'INCHIRIERE', rent: 800, price: 0, ownerId: owner.id },
        { title: 'Vilă vânzare', location: 'Cluj', transactionType: 'VANZARE', rent: 0, price: 300000, ownerId: owner.id },
        { title: 'Casă vânzare', location: 'Cluj', transactionType: 'VANZARE', rent: 0, price: 120000, ownerId: owner.id },
      ],
    })
  })

  it('filtrează doar vânzările după prețul de vânzare', async () => {
    const results = await searchAvailableProperties({ type: 'VANZARE', maxRent: '200000' })
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Casă vânzare')
    expect(results[0].price).toBe(120000)
  })

  it('filtrează doar închirierile după chirie', async () => {
    const results = await searchAvailableProperties({ type: 'INCHIRIERE', maxRent: '1000' })
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Garsonieră închiriere')
  })

  it('sortează vânzările crescător după preț', async () => {
    const results = await searchAvailableProperties({ type: 'VANZARE', sort: 'pret-asc' })
    expect(results.map((p) => p.price)).toEqual([120000, 300000])
  })

  it('fără tip, intervalul prinde închirieri după rent SAU vânzări după price', async () => {
    // 700–1500: prinde garsoniera (rent 800); niciun preț de vânzare nu intră în interval.
    const results = await searchAvailableProperties({ minRent: '700', maxRent: '1500' })
    expect(results.map((p) => p.title)).toEqual(['Garsonieră închiriere'])
  })
})
