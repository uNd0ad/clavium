import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Flag } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ReportResolveControls from '@/components/dashboard/ReportResolveControls'
import { getCurrentUser } from '@/lib/session'
import { getReports } from '@/lib/reports'

const REASON_LABELS: Record<string, string> = {
  FRAUD: 'Fraudă',
  FRAUD_AUTO: 'Fraudă (auto)',
  SPAM: 'Spam',
  INAPPROPRIATE: 'Neadecvat',
  OTHER: 'Altceva',
}

export default async function AdminReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')
  if (user.role !== 'ADMIN') redirect('/dashboard')

  const reports = await getReports('DESCHIS')

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Administrare"
        title="Coadă de"
        accent="moderare"
        description="Sesizări de abuz și fraudă (de la utilizatori sau din detecția automată)."
      />

      {reports.length === 0 ? (
        <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-[var(--muted)]">
          <Flag size={28} className="mx-auto mb-3 text-[var(--brand)]" />
          Nicio sesizare deschisă. Totul e în regulă.
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => {
            const targetHref =
              r.targetType === 'PROPERTY' ? `/proprietati/${r.targetId}` : `/dashboard/admin/utilizatori/${r.targetId}`
            return (
              <li key={r.id} className="rounded-4xl border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge label={REASON_LABELS[r.reason] ?? r.reason} variant="warning" />
                      <span className="text-xs text-[var(--muted)]">
                        {r.targetType === 'PROPERTY' ? 'Listare' : 'Utilizator'} ·{' '}
                        {new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(r.createdAt)}
                      </span>
                    </div>
                    <Link href={targetHref} className="mt-2 block truncate text-base font-semibold text-[var(--brand)]">
                      {r.targetLabel}
                    </Link>
                    {r.details ? <p className="mt-2 whitespace-pre-line text-sm text-[var(--muted)]">{r.details}</p> : null}
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      Raportat de: {r.reporterName ?? 'Sistem (detecție automată)'}
                    </p>
                  </div>
                  <ReportResolveControls reportId={r.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
