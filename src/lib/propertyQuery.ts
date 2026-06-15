import { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { parsePhotos } from './storage'
import type { PropertyCardData } from '@/components/properties/PropertyCard'

export type PropertyFilters = {
  q?: string
  type?: string // INCHIRIERE | VANZARE (gol = ambele)
  minRent?: string
  maxRent?: string
  rooms?: string
  minSurface?: string
  sort?: string
}

const num = (value?: string) => {
  const parsed = Number(value)
  return value && Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export async function searchAvailableProperties(filters: PropertyFilters): Promise<PropertyCardData[]> {
  const minAmount = num(filters.minRent)
  const maxAmount = num(filters.maxRent)
  const rooms = num(filters.rooms)
  const minSurface = num(filters.minSurface)
  const type = filters.type === 'VANZARE' ? 'VANZARE' : filters.type === 'INCHIRIERE' ? 'INCHIRIERE' : undefined

  // Intervalul de preț se aplică pe coloana potrivită tipului: `rent` la închiriere, `price` la vânzare.
  const range = minAmount || maxAmount ? { ...(minAmount ? { gte: minAmount } : {}), ...(maxAmount ? { lte: maxAmount } : {}) } : undefined

  const and: Prisma.PropertyWhereInput[] = []
  // `mode: 'insensitive'` — pe Postgres `contains` e altfel sensibil la majuscule (ex: „cluj" nu ar prinde „Cluj").
  if (filters.q)
    and.push({
      OR: [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { location: { contains: filters.q, mode: 'insensitive' } },
      ],
    })
  if (rooms) and.push({ rooms: { gte: rooms } })
  if (minSurface) and.push({ surface: { gte: minSurface } })
  if (type) {
    and.push({ transactionType: type })
    if (range) and.push(type === 'VANZARE' ? { price: range } : { rent: range })
  } else if (range) {
    // Fără tip selectat, intervalul filtrează închirieri după `rent` SAU vânzări după `price`.
    and.push({
      OR: [
        { transactionType: 'INCHIRIERE', rent: range },
        { transactionType: 'VANZARE', price: range },
      ],
    })
  }

  // Sortarea după preț folosește coloana tipului selectat; fără tip, revine la cele mai noi.
  const dir = filters.sort === 'pret-asc' ? ('asc' as const) : filters.sort === 'pret-desc' ? ('desc' as const) : null
  const orderBy: Prisma.PropertyOrderByWithRelationInput = dir
    ? type === 'VANZARE'
      ? { price: dir }
      : { rent: dir }
    : { createdAt: 'desc' }

  const properties = await prisma.property.findMany({
    where: { status: 'DISPONIBILA', ...(and.length ? { AND: and } : {}) },
    orderBy,
    take: 60,
  })

  return properties.map((property) => ({
    id: property.id,
    title: property.title,
    location: property.location,
    transactionType: property.transactionType === 'VANZARE' ? 'VANZARE' : 'INCHIRIERE',
    rent: property.rent,
    price: property.price,
    rooms: property.rooms,
    surface: property.surface,
    photos: parsePhotos(property.photos),
  }))
}
