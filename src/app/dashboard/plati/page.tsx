import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { getCurrentUser } from '@/lib/session'
import { getPayments } from '@/lib/dashboardData'

export default async function DashboardPaymentsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  if (user.role === 'CLIENT') {
    redirect('/dashboard')
  }

  const { summary, transactions } = await getPayments(user)

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Plăți"
        title="Istoric și"
        accent="rezumat plăți"
        description="Tranzacții, scadențe și comisioane."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Rezumat plăți</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Venit total</p>
              <p className="mt-3 text-2xl font-semibold">{summary.totalIncome}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">În așteptare</p>
              <p className="mt-3 text-2xl font-semibold">{summary.pending}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Comisioane</p>
              <p className="mt-3 text-2xl font-semibold">{summary.fees}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Raport comisioane</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Structura comisioanelor este afișată pentru fiecare tranzacție.</p>
          <div className="mt-6 space-y-3">
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Comision standard</p>
              <p className="mt-2 text-lg font-semibold">5%</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Comision QES</p>
              <p className="mt-2 text-lg font-semibold">1.8%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h2 className="text-xl font-semibold">Tranzacții recente</h2>
        <div className="mt-6 space-y-4">
          {transactions.length === 0 ? (
            <p className="rounded-[24px] border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)]">
              Nu există tranzacții încă. Plățile vor apărea aici după primul contract activ.
            </p>
          ) : (
            transactions.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{item.reference}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{item.type} - {item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold">{item.amount}</p>
                    <StatusBadge label={item.status} variant={item.statusVariant} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
