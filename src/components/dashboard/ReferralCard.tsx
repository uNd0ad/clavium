'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Gift, Copy, Check } from 'lucide-react'

// Cardul programului de recomandare: codul propriu + linkul partajabil + numărul de recomandări.
export default function ReferralCard({ code, count }: { code: string; count: number }) {
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? `${window.location.origin}/auth/register?ref=${code}` : `/auth/register?ref=${code}`

  const copy = () => {
    navigator.clipboard?.writeText(link).then(
      () => {
        setCopied(true)
        toast.success('Link de recomandare copiat.')
        setTimeout(() => setCopied(false), 2000)
      },
      () => toast.error('Nu am putut copia.')
    )
  }

  return (
    <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <div className="flex items-center gap-3">
        <Gift size={20} className="text-[var(--brand)]" />
        <div>
          <h2 className="text-xl font-semibold">Recomandă Vatrio</h2>
          <p className="text-sm text-[var(--muted)]">
            {count > 0 ? `Ai recomandat ${count} ${count === 1 ? 'persoană' : 'persoane'}.` : 'Invită cunoscuți cu linkul tău.'}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[var(--card)] px-4 py-3">
        <div className="min-w-0">
          <p className="text-2xs uppercase tracking-[0.18em] text-[var(--muted)]">Codul tău</p>
          <p className="font-mono text-lg font-semibold">{code}</p>
        </div>
        <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--brand)] transition hover:border-[var(--brand)]">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copiat' : 'Copiază linkul'}
        </button>
      </div>
    </div>
  )
}
