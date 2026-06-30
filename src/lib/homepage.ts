// Datele dinamice ale homepage-ului (listări recente + contoare), cache-uite între request-uri
// (~10 min). Layout-ul citește cookie-uri (limbă), deci ruta e oricum dinamică — cache-ul ține
// interogările DB ieftine sub trafic. Întoarce DATE serializabile; randarea cardurilor stă în page.
import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'
import { searchAvailableProperties } from './propertyQuery'
import type { PropertyCardData } from '@/components/properties/PropertyCard'

export type HomeData = {
  listings: PropertyCardData[]
  stats: { properties: number; contracts: number }
}

export async function getHomeData(): Promise<HomeData> {
  return unstable_cache(
    async () => {
      const [listings, properties, contracts] = await Promise.all([
        searchAvailableProperties({}),
        prisma.property.count({ where: { status: 'DISPONIBILA' } }),
        // „Contracte semnate" = ambele părți au semnat.
        prisma.contract.count({ where: { signedByOwner: true, signedByClient: true } }),
      ])
      return { listings: listings.slice(0, 4), stats: { properties, contracts } }
    },
    ['home-data'],
    { revalidate: 600 }
  )()
}
