import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatusBadge from '@/components/dashboard/StatusBadge'
import EmptyState from '@/components/dashboard/EmptyState'
import { OfferActions } from '@/components/dashboard/actions'
import { getCurrentUser } from '@/lib/session'
import { getOffers, type OfferView } from '@/lib/dashboardData'

function OfferList({ offers, emptyMessage, emptyCta }: { offers: OfferView[]; emptyMessage: string; emptyCta?: { label: string; href: string } }) {
  if (offers.length === 0) {
    return <EmptyState message={emptyMessage} cta={emptyCta} className="mt-6 p-5" />
  }

  return (
    <div className="mt-6 space-y-4">
      {offers.map((offer) => (
        <div key={offer.id} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
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
      <DashboardHeader
        eyebrow="Oferte"
        title="Gestionează"
        accent="ofertele tale"
        description="Urmărește ce ai trimis și răspunde ofertelor primite."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Oferte trimise</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Urmărește ofertele trimise și starea lor curentă.</p>
          <OfferList
            offers={sent}
            emptyMessage="Nu ai trimis nicio ofertă încă."
            emptyCta={user.role === 'CLIENT' ? { label: 'Caută proprietăți', href: '/dashboard/cauta' } : undefined}
          />
        </div>

        <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-xl font-semibold">Oferte primite</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Răspunde rapid ofertelor primite.</p>
          <OfferList offers={received} emptyMessage="Nu ai primit nicio ofertă încă." />
        </div>
      </div>
    </section>
  )
}
