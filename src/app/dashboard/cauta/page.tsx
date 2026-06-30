import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import EmptyState from '@/components/dashboard/EmptyState'
import PropertyCard from '@/components/properties/PropertyCard'
import PropertyFiltersForm from '@/components/properties/PropertyFiltersForm'
import ListingActions from '@/components/properties/ListingActions'
import SavedSearches, { type SavedSearchView } from '@/components/dashboard/SavedSearches'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { searchAvailableProperties, type PropertyFilters } from '@/lib/propertyQuery'
import { sanitizeFilters, describeFilters } from '@/lib/savedSearches'
import { getEurRonRate } from '@/lib/exchangeRate'

export default async function DashboardSearchPage({ searchParams }: { searchParams: Promise<PropertyFilters> }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const filters = await searchParams
  const [properties, saved, savedSearchRows, eurRate] = await Promise.all([
    searchAvailableProperties(filters),
    prisma.savedProperty.findMany({ where: { userId: user.id }, select: { propertyId: true } }),
    prisma.savedSearch.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    getEurRonRate(),
  ])
  const savedIds = new Set(saved.map((entry) => entry.propertyId))

  const savedSearches: SavedSearchView[] = savedSearchRows.map((row) => {
    let parsed: PropertyFilters = {}
    try {
      parsed = sanitizeFilters(JSON.parse(row.filters))
    } catch {
      parsed = {}
    }
    return {
      id: row.id,
      label: row.name || describeFilters(parsed),
      query: new URLSearchParams(parsed as Record<string, string>).toString(),
    }
  })
  const hasFilters = Boolean(filters.q || filters.type || filters.minRent || filters.maxRent || filters.rooms || filters.sort)

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Caută"
        title="Proprietăți"
        accent="disponibile"
        description="Filtrează, salvează și trimite oferte direct din listă."
      />

      <PropertyFiltersForm filters={filters} />

      <SavedSearches current={filters} searches={savedSearches} />

      {properties.length === 0 ? (
        <EmptyState
          message="Nicio proprietate nu corespunde căutării. Încearcă alte filtre."
          cta={hasFilters ? { label: 'Resetează filtrele', href: '/dashboard/cauta' } : undefined}
          className="p-8 text-base"
        />
      ) : (
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
            {properties.length} {properties.length === 1 ? 'proprietate disponibilă' : 'proprietăți disponibile'}
          </p>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} eurRate={eurRate}>
                <ListingActions
                  propertyId={property.id}
                  initialSaved={savedIds.has(property.id)}
                  canOffer={user.role === 'CLIENT'}
                  transactionType={property.transactionType}
                />
              </PropertyCard>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
