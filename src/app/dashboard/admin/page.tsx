import { redirect } from 'next/navigation'
import AdminUsersTable, { type AdminUserRow } from '@/components/dashboard/AdminUsersTable'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  if (user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [users, propertyCount, contractCount, offerCount] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.property.count(),
    prisma.contract.count(),
    prisma.offer.count(),
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
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Administrare</p>
        <h1 className="mt-3 text-3xl font-semibold">Panou de administrare</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Utilizatori', value: users.length },
          { label: 'Proprietăți', value: propertyCount },
          { label: 'Contracte', value: contractCount },
          { label: 'Oferte', value: offerCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Utilizatori</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Schimbă rolurile sau dezactivează conturi. Modificările revocă sesiunile active ale utilizatorului.
        </p>
        <div className="mt-6">
          <AdminUsersTable users={rows} />
        </div>
      </div>
    </section>
  )
}
