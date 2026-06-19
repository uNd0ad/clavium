'use client'

import { useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { Menu, X, Home, ShoppingBag, FileText, LifeBuoy, Layers, CreditCard, User, ShieldCheck, BadgeCheck, Search, Bell } from 'lucide-react'
import { dashboardNavItems, UserProfile } from '@/types/dashboard'
import LogoutButton from './LogoutButton'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useUnreadCount } from './NotificationContext'

const iconMap = {
  home: Home,
  search: Search,
  offer: ShoppingBag,
  contracts: FileText,
  tickets: LifeBuoy,
  properties: Layers,
  payments: CreditCard,
  profile: User,
  verify: BadgeCheck,
  admin: ShieldCheck,
} as const

export default function MobileTopBar({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false)
  const unread = useUnreadCount()
  const items = dashboardNavItems.filter((item) => item.roles.includes(user.role))

  return (
    <div className="lg:hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 print:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted)]">Dashboard</p>
          <p className="text-base font-semibold">Bun venit, {user.firstName}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {unread > 0 ? (
            <Link
              href="/dashboard/profil"
              aria-label={`${unread} notificări necitite`}
              className="relative rounded-full border border-[var(--border)] p-3 text-[var(--brand)]"
            >
              <Bell size={20} />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--brand)] px-1 text-2xs font-semibold text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            </Link>
          ) : null}
          <button onClick={() => setOpen(!open)} className="rounded-full border border-[var(--border)] p-3 text-[var(--text)]">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div className={clsx('mt-4 space-y-3 transition-all duration-300', open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden')}>
        {items.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium text-[var(--text)]">
              <Icon size={18} className="text-[var(--muted)]" />
              {item.label}
            </Link>
          )
        })}
        <LogoutButton className="border border-[var(--border)] bg-[var(--card)]" />
      </div>
    </div>
  )
}
