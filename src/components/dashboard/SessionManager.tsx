'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Monitor, LogOut } from 'lucide-react'
import Button from '@/components/ui/Button'
import { revokeSessionAction, revokeOtherSessionsAction } from '@/app/actions/sessions'

export type SessionView = {
  id: string
  label: string
  ip: string | null
  lastSeen: string
  isCurrent: boolean
}

export default function SessionManager({ sessions }: { sessions: SessionView[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [loading, startTransition] = useTransition()
  const hasOthers = sessions.some((s) => !s.isCurrent)

  const revoke = (id: string) =>
    startTransition(async () => {
      setBusy(id)
      const res = await revokeSessionAction(id)
      setBusy(null)
      if (res.ok) {
        toast.success('Dispozitiv deconectat.')
        router.refresh()
      } else toast.error(res.error)
    })

  const revokeOthers = () =>
    startTransition(async () => {
      setBusy('others')
      const res = await revokeOtherSessionsAction()
      setBusy(null)
      if (res.ok) {
        toast.success(res.count > 0 ? `${res.count} ${res.count === 1 ? 'dispozitiv deconectat' : 'dispozitive deconectate'}.` : 'Nu existau alte sesiuni active.')
        router.refresh()
      } else toast.error(res.error)
    })

  return (
    <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Monitor size={20} className="text-[var(--brand)]" />
          <div>
            <h2 className="text-xl font-semibold">Sesiuni active</h2>
            <p className="text-sm text-[var(--muted)]">Dispozitivele conectate la contul tău.</p>
          </div>
        </div>
        {hasOthers ? (
          <Button type="button" variant="outline" loading={loading && busy === 'others'} onClick={revokeOthers} className="px-4 py-2 text-xs">
            Deconectează celelalte
          </Button>
        ) : null}
      </div>

      <ul className="mt-6 space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-[var(--card)] p-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold">
                {s.label}
                {s.isCurrent ? (
                  <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 text-2xs font-semibold text-emerald-700 dark:text-emerald-400">acest dispozitiv</span>
                ) : null}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {s.ip ? `IP ${s.ip} · ` : ''}activ {s.lastSeen}
              </p>
            </div>
            {s.isCurrent ? null : (
              <button
                type="button"
                onClick={() => revoke(s.id)}
                disabled={loading && busy === s.id}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--danger)] disabled:opacity-50"
              >
                <LogOut size={13} /> Deconectează
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
