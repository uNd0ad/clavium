'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Flag } from 'lucide-react'
import Button from '@/components/ui/Button'
import { reportAction } from '@/app/actions/reports'

const REASONS: { value: string; label: string }[] = [
  { value: 'FRAUD', label: 'Fraudă / înșelătorie' },
  { value: 'SPAM', label: 'Spam / duplicat' },
  { value: 'INAPPROPRIATE', label: 'Conținut neadecvat' },
  { value: 'OTHER', label: 'Altceva' },
]

// Buton de sesizare (report/flag) pentru o listare sau un utilizator. Deschide un mic formular cu
// motiv + detalii opționale; raportarea ajunge în coada de moderare a adminilor.
export default function ReportButton({
  targetType,
  targetId,
  isAuthenticated,
}: {
  targetType: 'PROPERTY' | 'USER'
  targetId: string
  isAuthenticated: boolean
}) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('FRAUD')
  const [details, setDetails] = useState('')
  const [loading, startTransition] = useTransition()

  if (!isAuthenticated) return null

  const submit = () =>
    startTransition(async () => {
      const res = await reportAction(targetType, targetId, reason, details)
      if (res.ok) {
        toast.success(res.alreadyReported ? 'Ai raportat deja acest element.' : 'Mulțumim. Sesizarea a fost trimisă echipei de moderare.')
        setOpen(false)
        setDetails('')
      } else {
        toast.error(res.error)
      }
    })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--danger)]"
      >
        <Flag size={13} /> Raportează
      </button>
    )
  }

  return (
    <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Flag size={14} className="text-[var(--danger)]" /> Raportează această {targetType === 'PROPERTY' ? 'listare' : 'persoană'}
      </h3>
      <div className="mt-3 space-y-3">
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none transition focus:border-[var(--brand)]"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Detalii (opțional)"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
        />
        <div className="flex gap-2">
          <Button type="button" loading={loading} onClick={submit} className="px-4 py-2 text-xs">
            Trimite sesizarea
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="px-4 py-2 text-xs">
            Renunță
          </Button>
        </div>
      </div>
    </div>
  )
}
