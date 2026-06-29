import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Flag } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import AdminUsersTable, { type AdminUserRow } from '@/components/dashboard/AdminUsersTable'
import AuditVerifyCard from '@/components/dashboard/AuditVerifyCard'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { countOpenReports } from '@/lib/reports'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [users, propertyCount, contractCount, offerCount, openReports] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.property.count(),
    prisma.contract.count(),
    prisma.offer.count(),
    countOpenReports(),
  ])

  const rows: AdminUserRow[] = users.map((entry) => ({
    id: entry.id,
    name: `${entry.firstName} ${entry.lastName}`,
    email: entry.email,
    role: entry.role,
    isActive: entry.isActive,
    createdAt: new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' }).format(entry.createdAt),
    isSelf: entry.id === user.id,
  }))

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Administrare"
        title="Panou de"
        accent="administrare"
        description="Utilizatori, roluri și statistici de platformă."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Utilizatori', value: users.length },
          { label: 'Proprietăți', value: propertyCount },
          { label: 'Contracte', value: contractCount },
          { label: 'Oferte', value: offerCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.02em]">{stat.value}</p>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/admin/raportari"
        className="flex items-center justify-between gap-4 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition hover:border-[var(--brand)]"
      >
        <div className="flex items-center gap-3">
          <Flag size={20} className="text-[var(--brand)]" />
          <div>
            <h2 className="text-lg font-semibold">Coadă de moderare</h2>
            <p className="text-sm text-[var(--muted)]">Sesizări de abuz și fraudă în așteptare.</p>
          </div>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${openReports > 0 ? 'bg-[var(--danger)]/15 text-[var(--danger)]' : 'bg-[var(--brand)]/10 text-[var(--muted)]'}`}>
          {openReports} {openReports === 1 ? 'sesizare' : 'sesizări'}
        </span>
      </Link>

      <AuditVerifyCard />

      <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <h2 className="text-xl font-semibold">Utilizatori</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Schimbă rolurile sau dezactivează conturi. Apasă „Suport” pentru verificare KYC, moderare
          listări și rambursări. Modificările de rol/activare revocă sesiunile active.
        </p>
        <div className="mt-6">
          <AdminUsersTable users={rows} />
        </div>
      </div>
    </section>
  )
}
