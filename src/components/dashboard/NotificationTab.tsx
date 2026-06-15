'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useUnreadCount } from './NotificationContext'

// Tab afișat doar când există notificări necitite; dispare automat după citire.
export default function NotificationTab() {
  const count = useUnreadCount()
  if (count <= 0) return null

  return (
    <Link
      href="/dashboard/profil"
      className="flex items-center justify-between gap-3 rounded-3xl border border-[var(--brand)]/30 bg-[var(--brand-soft)] px-4 py-3 text-sm font-medium text-[var(--text)] transition hover:border-[var(--brand)]"
    >
      <span className="flex items-center gap-3">
        <Bell size={18} className="text-[var(--brand)]" />
        Notificări
      </span>
      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[var(--brand)] px-2 text-xs font-semibold text-white">
        {count > 99 ? '99+' : count}
      </span>
    </Link>
  )
}
