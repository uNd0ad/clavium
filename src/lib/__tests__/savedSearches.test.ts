import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { processSavedSearchAlerts, sanitizeFilters, describeFilters } from '@/lib/savedSearches'

async function listing(ownerId: string, data: { title: string; location: string; rent?: number; price?: number; type?: string; createdAt?: Date }) {
  return prisma.property.create({
    data: {
      title: data.title,
      location: data.location,
      rent: data.rent ?? 0,
      price: data.price ?? 0,
      transactionType: data.type ?? 'INCHIRIERE',
      status: 'DISPONIBILA',
      ownerId,
      ...(data.createdAt ? { createdAt: data.createdAt } : {}),
    },
  })
}

describe('saved searches', () => {
  beforeEach(async () => { await resetDb() })

  it('sanitizeFilters păstrează doar valori valide', () => {
    const f = sanitizeFilters({ q: '  Cluj ', type: 'VANZARE', minRent: '0', maxRent: '2000', rooms: '-1', sort: 'pret-asc' as never })
    expect(f).toEqual({ q: 'Cluj', type: 'VANZARE', maxRent: '2000' })
    expect('sort' in f).toBe(false)
  })

  it('descrie filtrele lizibil', () => {
    expect(describeFilters({ type: 'INCHIRIERE', q: 'Centru', rooms: '2' })).toContain('De închiriat')
    expect(describeFilters({})).toBe('Toate proprietățile')
  })

  it('alertează listările noi care se potrivesc, o singură dată', async () => {
    const seeker = await makeUser('CLIENT', `s-${Math.random()}@ex.ro`)
    const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
    const search = await prisma.savedSearch.create({
      data: { userId: seeker.id, filters: JSON.stringify({ type: 'INCHIRIERE', q: 'Cluj' }), lastNotifiedAt: new Date(Date.now() - 60_000) },
    })

    // O listare care se potrivește (nouă) + una care nu (alt oraș).
    await listing(owner.id, { title: 'Apartament Cluj', location: 'Cluj', rent: 1500 })
    await listing(owner.id, { title: 'Garsonieră', location: 'Iași', rent: 1200 })

    const res = await processSavedSearchAlerts()
    expect(res.alerted).toBe(1)
    expect(await prisma.notification.count({ where: { userId: seeker.id, title: 'Listări noi pentru căutarea ta' } })).toBe(1)

    // lastNotifiedAt avansează → a doua rulare nu mai alertează (nicio listare nouă).
    expect((await processSavedSearchAlerts()).alerted).toBe(0)

    const refreshed = await prisma.savedSearch.findUniqueOrThrow({ where: { id: search.id } })
    expect(refreshed.lastNotifiedAt).not.toBeNull()
  })

  it('nu alertează pentru propriile listări ale căutătorului', async () => {
    const seeker = await makeUser('OWNER', `s-${Math.random()}@ex.ro`)
    await prisma.savedSearch.create({
      data: { userId: seeker.id, filters: JSON.stringify({ q: 'Cluj' }), lastNotifiedAt: new Date(Date.now() - 60_000) },
    })
    await listing(seeker.id, { title: 'Apartament Cluj', location: 'Cluj', rent: 1500 })
    expect((await processSavedSearchAlerts()).alerted).toBe(0)
  })
})
