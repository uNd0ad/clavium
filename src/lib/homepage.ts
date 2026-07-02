// Datele dinamice ale homepage-ului (listări recente + contoare).
//
// NU cache-uim aici: ruta e oricum randată dinamic (layout-ul citește headers()/cookie-uri), iar
// interogările sunt ieftine (un findMany plafonat la 60 + două count-uri). Un cache anterior de ~10
// min făcea ca fotografiile noi ale proprietăților să apară cu întârziere pe homepage — de aceea
// preferăm date proaspete la fiecare request. Întoarce DATE serializabile; randarea cardurilor stă în page.
import { prisma } from './prisma'
import { searchAvailableProperties } from './propertyQuery'
import type { PropertyCardData } from '@/components/properties/PropertyCard'

export type HomeData = {
  listings: PropertyCardData[]
  stats: { properties: number; contracts: number }
}

export async function getHomeData(): Promise<HomeData> {
  const [listings, properties, contracts] = await Promise.all([
    searchAvailableProperties({}),
    prisma.property.count({ where: { status: 'DISPONIBILA' } }),
    // „Contracte semnate" = ambele părți au semnat.
    prisma.contract.count({ where: { signedByOwner: true, signedByClient: true } }),
  ])
  return { listings: listings.slice(0, 4), stats: { properties, contracts } }
}
