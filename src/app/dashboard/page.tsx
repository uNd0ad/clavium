import StatusBadge from '@/components/dashboard/StatusBadge'
import { dashboardAlerts, dashboardActivity, dashboardStats } from '@/types/dashboard'

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold">Bun venit în centrul tău de control</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <div key={item.label} className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            {item.percentage ? <p className="mt-2 text-sm text-[var(--brand)]">{item.percentage}</p> : null}
            {item.highlight ? <p className="mt-4 text-sm text-[var(--muted)]">{item.highlight}</p> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Alerte</h2>
              <p className="text-sm text-[var(--muted)]">Urmărește cele mai importante notificări ale lunii.</p>
            </div>
            <StatusBadge label="Prioritar" variant="warning" />
          </div>
          <div className="space-y-4">
            {dashboardAlerts.map((alert) => (
              <div key={alert.title} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold">{alert.title}</p>
                    <p className="mt-2 text-sm text-[var(--muted)]">{alert.description}</p>
                  </div>
                  <StatusBadge label={alert.variant.toUpperCase()} variant={alert.variant} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Activitate recentă</h2>
              <p className="text-sm text-[var(--muted)]">Ultimele acțiuni în platformă.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {dashboardActivity.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
                  </div>
                  <StatusBadge label={item.status} variant={item.status} />
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
