'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { setAutopayAction } from '@/app/actions/autopay'

// Comutator pentru plata automată a chiriei (vizibil chiriașului pe un contract activ).
export default function AutopayToggle({ contractId, enabled }: { contractId: string; enabled: boolean }) {
  const router = useRouter()
  const [on, setOn] = useState(enabled)
  const [loading, startTransition] = useTransition()

  const toggle = () =>
    startTransition(async () => {
      const next = !on
      const res = await setAutopayAction(contractId, next)
      if (res.ok) {
        setOn(next)
        toast.success(next ? 'Plată automată activată.' : 'Plată automată dezactivată.')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  return (
    <div className="rounded-4xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <RefreshCw size={18} className="text-[var(--brand)]" /> Plată automată a chiriei
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Când e activă, chiria se încasează automat la fiecare scadență, fără să mai fie nevoie să plătești manual.
      </p>
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={on}
        aria-label={on ? 'Dezactivează plata automată a chiriei' : 'Activează plata automată a chiriei'}
        className={`mt-4 inline-flex h-7 w-12 items-center rounded-full p-0.5 transition disabled:opacity-60 ${on ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`}
      >
        <span className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <span className="ml-3 align-middle text-sm font-semibold">{on ? 'Activă' : 'Inactivă'}</span>
    </div>
  )
}
