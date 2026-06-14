import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { getCurrentUser } from '@/lib/session'
import { getOverview } from '@/lib/dashboardData'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { stats, alerts, activity } = await getOverview(user)

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Dashboard"
        title={`Bun venit, ${user.firstName}`}
        description="Tabloul de bord cu oferte, contracte, plăți și activitatea ta recentă."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
            <p className="text-[13px] uppercase tracking-[0.18em] text-[var(--muted)]">{item.label}</p>
            <p className="mt-3 text-[32px] font-semibold tracking-[-0.02em]">{item.value}</p>
            {item.highlight ? <p className="mt-4 text-sm text-[var(--muted)]">{item.highlight}</p> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Alerte</h2>
              <p className="text-sm text-[var(--muted)]">Urmărește cele mai importante notificări ale lunii.</p>
            </div>
            {alerts.length > 0 ? <StatusBadge label="Prioritar" variant="warning" /> : null}
          </div>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <p className="rounded-[24px] border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)]">
                Nu ai alerte active. Totul este la zi.
              </p>
            ) : (
              alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="group block rounded-[24px] border border-[var(--border)] bg-white p-5 transition hover:border-[var(--brand)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">{alert.title}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">{alert.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={alert.variant === 'danger' ? 'Urgent' : 'Atenție'} variant={alert.variant} />
                      <ChevronRight size={18} className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Activitate recentă</h2>
              <p className="text-sm text-[var(--muted)]">Ultimele acțiuni în platformă.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {activity.length === 0 ? (
              <p className="rounded-[24px] border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
                Nicio activitate încă. Acțiunile tale vor apărea aici.
              </p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
                    </div>
                    <StatusBadge label={item.status} variant={item.status} />
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted)]">{item.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
