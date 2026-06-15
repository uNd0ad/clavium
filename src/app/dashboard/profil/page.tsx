import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ProfileForms from '@/components/dashboard/ProfileForms'
import { MarkNotificationsRead } from '@/components/dashboard/actions'
import { getCurrentUser } from '@/lib/session'
import { getNotifications } from '@/lib/dashboardData'

export default async function DashboardProfilePage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const [notifications, { email: emailStatus }] = await Promise.all([getNotifications(user), searchParams])
  const hasUnread = notifications.some((notification) => !notification.read)

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Profil"
        title="Setările"
        accent="contului"
        description="Date personale, securitate și notificări."
      />

      {emailStatus === 'verificat' ? (
        <p className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
          Adresa de email a fost verificată cu succes ✓
        </p>
      ) : null}
      {emailStatus === 'eroare' ? (
        <p className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-semibold text-rose-800">
          Linkul de verificare este invalid sau expirat. Retrimite emailul de verificare mai jos.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-xl font-semibold">Date personale</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--muted)]">{user.accountType === 'COMPANY' ? 'Reprezentant legal' : 'Nume complet'}</p>
                <p className="mt-2 font-semibold">{user.firstName} {user.lastName}</p>
              </div>
              <div className="rounded-3xl bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--muted)]">Email {user.emailVerified ? '✓' : '(neverificat)'}</p>
                <p className="mt-2 font-semibold">{user.email}</p>
              </div>
              <div className="rounded-3xl bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--muted)]">Telefon</p>
                <p className="mt-2 font-semibold">{user.phone || '—'}</p>
              </div>
              <div className="rounded-3xl bg-[var(--card)] p-5">
                <p className="text-sm text-[var(--muted)]">Rol</p>
                <p className="mt-2 font-semibold">{user.role}</p>
              </div>
            </div>
          </div>

          {user.accountType === 'COMPANY' ? (
            <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
              <h2 className="text-xl font-semibold">Date firmă</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">Denumire</p>
                  <p className="mt-2 font-semibold">{user.companyName || '—'}</p>
                </div>
                <div className="rounded-3xl bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">CUI / CIF</p>
                  <p className="mt-2 font-semibold">{user.companyCui || '—'}</p>
                </div>
                <div className="rounded-3xl bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">Nr. înregistrare</p>
                  <p className="mt-2 font-semibold">{user.companyReg || '—'}</p>
                </div>
                <div className="rounded-3xl bg-[var(--card)] p-5">
                  <p className="text-sm text-[var(--muted)]">TVA</p>
                  <p className="mt-2 font-semibold">{user.companyVatPayer ? 'Plătitor' : 'Neplătitor'}</p>
                </div>
                {user.companyAddress ? (
                  <div className="rounded-3xl bg-[var(--card)] p-5 sm:col-span-2">
                    <p className="text-sm text-[var(--muted)]">Sediu</p>
                    <p className="mt-2 font-semibold">{user.companyAddress}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <ProfileForms
            firstName={user.firstName}
            lastName={user.lastName}
            phone={user.phone ?? ''}
            emailVerified={user.emailVerified}
          />
        </div>

        <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] self-start">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Notificări</h2>
            <MarkNotificationsRead hasUnread={hasUnread} />
          </div>
          <div className="mt-6 space-y-4">
            {notifications.length === 0 ? (
              <p className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
                Nu ai notificări noi.
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-3xl border p-5 ${notification.read ? 'border-[var(--border)] bg-[var(--card)] opacity-70' : 'border-[var(--brand)]/30 bg-[var(--card)]'}`}
                >
                  <p className="font-semibold">
                    {notification.read ? null : <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--brand)]" />}
                    {notification.title}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{notification.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{notification.date}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
