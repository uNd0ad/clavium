import Link from 'next/link'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import EmptyState from '@/components/dashboard/EmptyState'
import PropertyForm from '@/components/dashboard/PropertyForm'
import PropertyEditForm from '@/components/dashboard/PropertyEditForm'
import PhotoManager from '@/components/dashboard/PhotoManager'
import { PropertyStatusToggle } from '@/components/dashboard/actions'
import { getCurrentUser } from '@/lib/session'
import { getProperties, type PropertyView } from '@/lib/dashboardData'

function PropertyList({ properties, emptyMessage, emptyCta, manageable = false }: { properties: PropertyView[]; emptyMessage: string; emptyCta?: { label: string; href: string }; manageable?: boolean }) {
  if (properties.length === 0) {
    return <EmptyState message={emptyMessage} cta={emptyCta} className="mt-6 p-5" />
  }

  return (
    <div className="mt-6 space-y-4">
      {properties.map((property) => (
        <div key={property.id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{property.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{property.location}</p>
            </div>
            <StatusBadge label={property.status} variant={property.statusVariant} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">
              <span className="mr-2 rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-2xs font-semibold text-[var(--brand)]">
                {property.transactionType === 'VANZARE' ? 'Vânzare' : 'Închiriere'}
              </span>
              {property.price}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              {manageable && property.pendingOffers > 0 ? (
                <Link href="/dashboard/oferte" className="font-semibold text-[var(--brand)]">
                  {property.pendingOffers} {property.pendingOffers === 1 ? 'ofertă' : 'oferte'} în așteptare
                </Link>
              ) : null}
              <p>Actualizat: {property.updated}</p>
            </div>
          </div>
          {manageable ? (
            <>
              <PhotoManager propertyId={property.id} photos={property.photos} />
              {property.status === 'Disponibilă' ? (
                <PropertyEditForm
                  propertyId={property.id}
                  title={property.title}
                  location={property.location}
                  transactionType={property.transactionType}
                  rent={property.rentValue}
                  price={property.priceValue}
                  rooms={property.rooms}
                  surface={property.surface}
                  description={property.description}
                />
              ) : null}
              <PropertyStatusToggle propertyId={property.id} status={property.status} />
            </>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default async function DashboardPropertiesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  if (user.role === 'CLIENT') {
    redirect('/dashboard')
  }

  const { owned, saved } = await getProperties(user)

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Proprietăți"
        title="Proprietățile"
        accent="tale"
        description="Adaugă, editează și urmărește listările tale."
      />

      <PropertyForm />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Proprietăți active</h2>
          <PropertyList properties={owned} emptyMessage="Nu ai adăugat nicio proprietate încă." manageable />
        </div>

        <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Proprietăți salvate</h2>
          <PropertyList
            properties={saved}
            emptyMessage="Nu ai salvat nicio proprietate încă."
            emptyCta={{ label: 'Caută proprietăți', href: '/dashboard/cauta' }}
          />
        </div>
      </div>
    </section>
  )
}
