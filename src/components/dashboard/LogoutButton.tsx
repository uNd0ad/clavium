'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import clsx from 'clsx'

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={clsx(
        'group flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-[var(--text)] transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-300',
        className
      )}
    >
      <LogOut size={18} className="text-[var(--muted)] transition group-hover:text-rose-600 dark:group-hover:text-rose-400" />
      {loading ? 'Se deconectează…' : 'Deconectare'}
    </button>
  )
}
