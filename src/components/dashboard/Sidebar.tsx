'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { Home, ShoppingBag, FileText, Layers, CreditCard, User } from 'lucide-react'
import { dashboardNavItems, UserProfile } from '@/types/dashboard'
import { ROLE_DESCRIPTIONS } from '@/lib/types/roles'

const iconMap = {
  home: Home,
  offer: ShoppingBag,
  contracts: FileText,
  properties: Layers,
  payments: CreditCard,
  profile: User,
} as const

export default function Sidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname()
  const items = dashboardNavItems.filter((item) => item.roles.includes(user.role))

  return (
    <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-6 border-r border-[var(--border)] bg-[var(--surface)] px-6 py-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-[var(--brand)]">{user.firstName[0]}</div>
          <div>
            <p className="text-sm font-semibold">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-[13px] text-[var(--muted)]">{user.role}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted)]">{ROLE_DESCRIPTIONS[user.role]}</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon]
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition',
                active ? 'bg-[var(--brand)] text-white' : 'text-[var(--text)] hover:bg-[var(--brand-soft)] hover:text-[var(--text)]'
              )}
            >
              <Icon size={18} className={active ? 'text-white' : 'text-[var(--muted)]'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-[32px] border border-[var(--border)] bg-white p-5 text-sm text-[var(--text)]">
        <p className="font-semibold">Tip utilizator</p>
        <p className="mt-2 text-[13px] text-[var(--muted)]">Acest panou afișează informații și acțiuni disponibile pentru rolul tău.</p>
      </div>
    </aside>
  )
}
