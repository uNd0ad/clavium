import StatusBadge from '@/components/dashboard/StatusBadge'
import { dashboardMockUser, dashboardProfileNotifications } from '@/types/dashboard'

export default function DashboardProfilePage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Profil</p>
        <h1 className="mt-3 text-3xl font-semibold">Setările contului</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Date personale</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Nume complet</p>
              <p className="mt-2 font-semibold">{dashboardMockUser.firstName} {dashboardMockUser.lastName}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Email</p>
              <p className="mt-2 font-semibold">{dashboardMockUser.email}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Telefon</p>
              <p className="mt-2 font-semibold">{dashboardMockUser.phone}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Rol</p>
              <p className="mt-2 font-semibold">{dashboardMockUser.role}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Notificări</h2>
          <div className="mt-6 space-y-4">
            {dashboardProfileNotifications.map((notification) => (
              <div key={notification.title} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <p className="font-semibold">{notification.title}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{notification.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{notification.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Danger zone</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">Acțiuni critice pentru contul tău.</p>
          </div>
          <StatusBadge label="Atenție" variant="danger" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-left text-sm font-semibold text-rose-800">Resetează parola</button>
          <button className="rounded-[24px] border border-rose-200 bg-white px-5 py-4 text-left text-sm font-semibold text-rose-800">Dezactivează contul</button>
        </div>
      </div>
    </section>
  )
}
