import { redirect } from 'next/navigation'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { OfferActions } from '@/components/dashboard/actions'
import { getCurrentUser } from '@/lib/session'
import { getOffers, type OfferView } from '@/lib/dashboardData'

function OfferList({ offers, emptyMessage }: { offers: OfferView[]; emptyMessage: string }) {
  if (offers.length === 0) {
    return <p className="mt-6 rounded-[24px] border border-[var(--border)] bg-white p-5 text-sm text-[var(--muted)]">{emptyMessage}</p>
  }

  return (
    <div className="mt-6 space-y-4">
      {offers.map((offer) => (
        <div key={offer.id} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{offer.property}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{offer.counterparty}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{offer.amount}</span>
              <StatusBadge label={offer.status} variant={offer.statusVariant} />
            </div>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">{offer.date}</p>
          {offer.actionable ? <OfferActions offerId={offer.id} /> : null}
        </div>
      ))}
    </div>
  )
}

export default async function DashboardOffersPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const { sent, received } = await getOffers(user)

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
          <OfferList offers={sent} emptyMessage="Nu ai trimis nicio ofertă încă." />
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="text-xl font-semibold">Oferte primite</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Răspunde rapid ofertelor primite.</p>
          <OfferList offers={received} emptyMessage="Nu ai primit nicio ofertă încă." />
        </div>
      </div>
    </section>
  )
}
