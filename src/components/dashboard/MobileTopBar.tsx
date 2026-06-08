'use client'

import { useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { Menu, X, Home, ShoppingBag, FileText, Layers, CreditCard, User } from 'lucide-react'
import { dashboardNavItems, UserProfile } from '@/types/dashboard'

const iconMap = {
  home: Home,
  offer: ShoppingBag,
  contracts: FileText,
  properties: Layers,
  payments: CreditCard,
  profile: User,
} as const

export default function MobileTopBar({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false)
  const items = dashboardNavItems.filter((item) => item.roles.includes(user.role))

  return (
    <div className="lg:hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] uppercase tracking-[0.28em] text-[var(--muted)]">Dashboard</p>
          <p className="text-base font-semibold">Bun venit, {user.firstName}</p>
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-full border border-[var(--border)] p-3 text-[var(--text)]">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={clsx('mt-4 space-y-3 transition-all duration-300', open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden')}>
        {items.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-3xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium text-[var(--text)]">
              <Icon size={18} className="text-[var(--muted)]" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
