import StatusBadge from '@/components/dashboard/StatusBadge'
import { dashboardOffers } from '@/types/dashboard'

export default function DashboardOffersPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Oferte</p>
        <h1 className="mt-3 text-3xl font-semibold">Gestionare oferte</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Oferte trimise</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Urmărește ofertele trimise și starea lor curentă.</p>
          <div className="mt-6 space-y-4">
            {dashboardOffers.sent.map((offer) => (
              <div key={offer.property} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{offer.property}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{offer.counterparty}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{offer.amount}</span>
                    <StatusBadge label={offer.status} variant={offer.status === 'Respinsă' ? 'danger' : offer.status === 'Trimisă' ? 'info' : 'success'} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">{offer.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Oferte primite</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Răspunde rapid ofertelor primite de la potențiali chiriași.</p>
          <div className="mt-6 space-y-4">
            {dashboardOffers.received.map((offer) => (
              <div key={offer.property} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{offer.property}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{offer.counterparty}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{offer.amount}</span>
                    <StatusBadge label={offer.status} variant={offer.status === 'Primita' ? 'info' : 'success'} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">{offer.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
