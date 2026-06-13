import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PropertyCard from '@/components/properties/PropertyCard'
import PropertyFiltersForm from '@/components/properties/PropertyFiltersForm'
import { searchAvailableProperties, type PropertyFilters } from '@/lib/propertyQuery'

export const metadata: Metadata = {
  title: 'Proprietăți de închiriat — Clavium.ro',
  description: 'Caută proprietăți de închiriat direct de la proprietari, fără intermediari.',
}

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<PropertyFilters> }) {
  const filters = await searchParams
  const properties = await searchAvailableProperties(filters)

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-6 pb-24 pt-36 lg:px-12">
        <p className="section-label">Proprietăți</p>
        <h1 className="mt-4 text-4xl font-semibold">Caută direct de la proprietari</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--muted)]">
          Fără comisioane de agenție, fără intermediari. Trimite o ofertă și semnează contractul online.
        </p>

        <div className="mt-10">
          <PropertyFiltersForm filters={filters} />
        </div>

        {properties.length === 0 ? (
          <p className="mt-12 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 text-[15px] text-[var(--muted)]">
            Nicio proprietate nu corespunde căutării. Încearcă alte filtre.
          </p>
        ) : (
          <>
            <p className="mt-10 text-[13px] uppercase tracking-[0.18em] text-[var(--muted)]">
              {properties.length} {properties.length === 1 ? 'proprietate disponibilă' : 'proprietăți disponibile'}
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
