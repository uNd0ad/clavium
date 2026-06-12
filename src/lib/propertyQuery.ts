import { prisma } from './prisma'
import { parsePhotos } from './storage'
import type { PropertyCardData } from '@/components/properties/PropertyCard'

export type PropertyFilters = {
  q?: string
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
  const minRent = num(filters.minRent)
  const maxRent = num(filters.maxRent)
  const rooms = num(filters.rooms)
  const minSurface = num(filters.minSurface)

  const orderBy =
    filters.sort === 'pret-asc'
      ? { rent: 'asc' as const }
      : filters.sort === 'pret-desc'
        ? { rent: 'desc' as const }
        : { createdAt: 'desc' as const }

  const properties = await prisma.property.findMany({
    where: {
      status: 'DISPONIBILA',
      ...(filters.q ? { OR: [{ title: { contains: filters.q } }, { location: { contains: filters.q } }] } : {}),
      ...(minRent || maxRent ? { rent: { ...(minRent ? { gte: minRent } : {}), ...(maxRent ? { lte: maxRent } : {}) } } : {}),
      ...(rooms ? { rooms: { gte: rooms } } : {}),
      ...(minSurface ? { surface: { gte: minSurface } } : {}),
    },
    orderBy,
    take: 60,
  })

  return properties.map((property) => ({
    id: property.id,
    title: property.title,
    location: property.location,
    rent: property.rent,
    rooms: property.rooms,
    surface: property.surface,
    photos: parsePhotos(property.photos),
  }))
}
