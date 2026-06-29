// Ajutoare SEO: URL-uri absolute + date structurate schema.org pentru listări (Google Rich Results).
import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'
import { APP_URL } from './constants'
import { parsePhotos } from './storage'

export function absoluteUrl(path: string): string {
  return `${APP_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
}

// Citire publică a unei listări, cache-uită între request-uri (ISR: revalidare la cel mult o oră).
// Întoarce null pentru listări inexistente sau ascunse. Sigur într-o rută dinamică — nu citește
// cookie-uri. Modificările de la proprietar/admin se propagă în fereastra de revalidare.
export async function getPublicListing(id: string) {
  return unstable_cache(
    async () => {
      const property = await prisma.property.findUnique({
        where: { id },
        include: { owner: { select: { firstName: true, lastName: true, createdAt: true } } },
      })
      if (!property || property.status === 'INACTIVA') return null
      return property
    },
    ['public-listing', id],
    { revalidate: 3600 }
  )()
}

type ListingForLd = {
  id: string
  title: string
  description: string | null
  location: string
  transactionType: string
  status: string
  price: number
  rent: number
  rooms: number | null
  surface: number | null
  photos: string
}

// Obiect JSON-LD schema.org pentru o listare. Vânzare → `Offer`/Product-like; închiriere → preț/lună.
export function listingJsonLd(property: ListingForLd) {
  const isSale = property.transactionType === 'VANZARE'
  const photos = parsePhotos(property.photos).map((p) => (p.startsWith('http') ? p : absoluteUrl(p)))
  const price = isSale ? property.price : property.rent

  return {
    '@context': 'https://schema.org',
    '@type': isSale ? 'SingleFamilyResidence' : 'Apartment',
    name: property.title,
    description: property.description ?? property.title,
    url: absoluteUrl(`/proprietati/${property.id}`),
    ...(photos.length ? { image: photos } : {}),
    address: { '@type': 'PostalAddress', addressLocality: property.location, addressCountry: 'RO' },
    ...(property.rooms ? { numberOfRooms: property.rooms } : {}),
    ...(property.surface ? { floorSize: { '@type': 'QuantitativeValue', value: property.surface, unitCode: 'MTK' } } : {}),
    ...(price > 0
      ? {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: 'RON',
            availability: property.status === 'DISPONIBILA' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            ...(isSale ? {} : { description: 'Chirie lunară' }),
          },
        }
      : {}),
  }
}
