import StatusBadge from '@/components/dashboard/StatusBadge'
import { dashboardPayments } from '@/types/dashboard'

export default function DashboardPaymentsPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Plăți</p>
        <h1 className="mt-3 text-3xl font-semibold">Istoric tranzacții și rezumat</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Rezumat plăți</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Venit total</p>
              <p className="mt-3 text-2xl font-semibold">{dashboardPayments.summary.totalIncome}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">În așteptare</p>
              <p className="mt-3 text-2xl font-semibold">{dashboardPayments.summary.pending}</p>
            </div>
            <div className="rounded-[24px] bg-white p-5">
              <p className="text-sm text-[var(--muted)]">Comisioane</p>
              <p className="mt-3 text-2xl font-semibold">{dashboardPayments.summary.fees}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
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

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Tranzacții recente</h2>
        <div className="mt-6 space-y-4">
          {dashboardPayments.transactions.map((item) => (
            <div key={item.id} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{item.id}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.type} - {item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold">{item.amount}</p>
                  <StatusBadge label={item.status} variant={item.status === 'Finalizată' ? 'success' : item.status === 'În curs' ? 'warning' : 'danger'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
