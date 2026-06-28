import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import EmptyState from '@/components/dashboard/EmptyState'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { getCurrentUser } from '@/lib/session'
import { getInquiriesFor } from '@/lib/inquiries'

export default async function DashboardMessagesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const inquiries = await getInquiriesFor(user)
  const dateFmt = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Conversații"
        title="Mesaje"
        accent="pre-contract"
        description="Întrebări despre listări, înainte de orice ofertă sau contract. Ca proprietar vezi întrebările primite; ca utilizator, conversațiile inițiate."
      />

      <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        {inquiries.length === 0 ? (
          <EmptyState
            message="Nicio conversație încă. Deschide pagina unei listări și folosește „Întreabă proprietarul”."
            cta={{ label: 'Caută listări', href: '/proprietati' }}
          />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {inquiries.map((inq) => (
              <li key={inq.id}>
                <Link href={`/dashboard/mesaje/${inq.id}`} className="flex items-start gap-4 py-4 transition hover:opacity-80">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
                    <MessageCircle size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{inq.propertyTitle}</p>
                      <StatusBadge
                        label={inq.status === 'INCHIS' ? 'Închis' : 'Deschis'}
                        variant={inq.status === 'INCHIS' ? 'info' : 'success'}
                      />
                      <span className="text-xs text-[var(--muted)]">
                        {inq.role === 'owner' ? `de la ${inq.counterpart}` : `către ${inq.counterpart}`}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">{inq.lastMessage}</p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--muted)]">{dateFmt.format(inq.lastAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
