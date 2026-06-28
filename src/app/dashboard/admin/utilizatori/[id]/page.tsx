import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { KycOverrideControls, PropertyModerateControl, RefundControl } from '@/components/dashboard/AdminSupportControls'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { formatRon } from '@/lib/dashboardData'

// Pagină de suport (admin): vedere read-only a unui utilizator + acțiuni (KYC, moderare, rambursare).
export default async function AdminUserSupportPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser()
  if (!admin) redirect('/auth/login')
  if (admin.role !== 'ADMIN') redirect('/dashboard')

  const { id } = await params
  const target = await prisma.user.findUnique({
    where: { id },
    include: {
      properties: { orderBy: { createdAt: 'desc' }, take: 20 },
      payments: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })
  if (!target) notFound()

  const dateFmt = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' })
  const refundable = new Set(['CHIRIE', 'AVANS', 'REST', 'DAUNE'])

  return (
    <section className="space-y-8">
      <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
        <ArrowLeft size={15} /> Înapoi la administrare
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{target.firstName} {target.lastName}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{target.email} · {target.role} · membru din {dateFmt.format(target.createdAt)}</p>
      </div>

      <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-semibold">Verificare identitate (KYC)</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Suprascrie manual starea KYC pentru suport (acțiunea e auditată).</p>
        <div className="mt-4">
          <KycOverrideControls userId={target.id} current={target.kycStatus} />
        </div>
      </div>

      <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-semibold">Listări ({target.properties.length})</h2>
        {target.properties.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Nicio listare.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {target.properties.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <Link href={`/proprietati/${p.id}`} className="font-medium text-[var(--brand)]">{p.title}</Link>
                  <p className="text-xs text-[var(--muted)]">{p.location} · {p.status}</p>
                </div>
                <PropertyModerateControl propertyId={p.id} hidden={p.status === 'INACTIVA'} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-lg font-semibold">Plăți recente</h2>
        {target.payments.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Nicio plată.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {target.payments.map((pay) => (
              <li key={pay.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{formatRon(pay.amount)} · {pay.type}</p>
                  <p className="text-xs text-[var(--muted)]">{pay.reference} · {dateFmt.format(pay.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={pay.status} variant={pay.status === 'FINALIZATA' ? 'success' : pay.status === 'ESUATA' ? 'danger' : 'warning'} />
                  {pay.status === 'FINALIZATA' && refundable.has(pay.type) ? <RefundControl paymentId={pay.id} /> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
