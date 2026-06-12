import { redirect } from 'next/navigation'
import PropertyCard from '@/components/properties/PropertyCard'
import PropertyFiltersForm from '@/components/properties/PropertyFiltersForm'
import ListingActions from '@/components/properties/ListingActions'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { searchAvailableProperties, type PropertyFilters } from '@/lib/propertyQuery'

export default async function DashboardSearchPage({ searchParams }: { searchParams: Promise<PropertyFilters> }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const filters = await searchParams
  const [properties, saved] = await Promise.all([
    searchAvailableProperties(filters),
    prisma.savedProperty.findMany({ where: { userId: user.id }, select: { propertyId: true } }),
  ])
  const savedIds = new Set(saved.map((entry) => entry.propertyId))

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Caută</p>
        <h1 className="mt-3 text-3xl font-semibold">Proprietăți disponibile</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Filtrează, salvează și trimite oferte direct din listă.
        </p>
      </div>

      <PropertyFiltersForm filters={filters} />

      {properties.length === 0 ? (
        <p className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-[15px] text-[var(--muted)]">
          Nicio proprietate nu corespunde căutării. Încearcă alte filtre.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property}>
              <ListingActions
                propertyId={property.id}
                initialSaved={savedIds.has(property.id)}
                canOffer={user.role === 'CLIENT'}
              />
            </PropertyCard>
          ))}
        </div>
      )}
    </section>
  )
}
