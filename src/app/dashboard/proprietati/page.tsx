import StatusBadge from '@/components/dashboard/StatusBadge'
import { dashboardProperties } from '@/types/dashboard'

export default function DashboardPropertiesPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Proprietăți</p>
        <h1 className="mt-3 text-3xl font-semibold">Lista proprietăților tale</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Proprietăți active</h2>
          <div className="mt-6 space-y-4">
            {dashboardProperties.owned.map((property) => (
              <div key={property.title} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{property.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{property.location}</p>
                  </div>
                  <StatusBadge label={property.status} variant={property.status === 'Disponibilă' ? 'success' : 'warning'} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[var(--muted)]">{property.rent}</p>
                  <p className="text-sm text-[var(--muted)]">Actualizat: {property.updated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Proprietăți salvate</h2>
          <div className="mt-6 space-y-4">
            {dashboardProperties.saved.map((property) => (
              <div key={property.title} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{property.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{property.location}</p>
                  </div>
                  <StatusBadge label={property.status} variant="info" />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[var(--muted)]">{property.rent}</p>
                  <p className="text-sm text-[var(--muted)]">Actualizat: {property.updated}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
