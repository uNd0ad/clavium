import { redirect } from 'next/navigation'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { getCurrentUser } from '@/lib/session'
import { getProperties, type PropertyView } from '@/lib/dashboardData'

function PropertyList({ properties, emptyMessage }: { properties: PropertyView[]; emptyMessage: string }) {
  if (properties.length === 0) {
    return <p className="mt-6 rounded-[24px] border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)]">{emptyMessage}</p>
  }

  return (
    <div className="mt-6 space-y-4">
      {properties.map((property) => (
        <div key={property.id} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{property.title}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{property.location}</p>
            </div>
            <StatusBadge label={property.status} variant={property.statusVariant} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">{property.rent}</p>
            <p className="text-sm text-[var(--muted)]">Actualizat: {property.updated}</p>
          </div>
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
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Proprietăți</p>
        <h1 className="mt-3 text-3xl font-semibold">Lista proprietăților tale</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Proprietăți active</h2>
          <PropertyList properties={owned} emptyMessage="Nu ai adăugat nicio proprietate încă." />
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Proprietăți salvate</h2>
          <PropertyList properties={saved} emptyMessage="Nu ai salvat nicio proprietate încă." />
        </div>
      </div>
    </section>
  )
}
