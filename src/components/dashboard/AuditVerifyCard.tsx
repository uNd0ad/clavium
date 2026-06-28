'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, ShieldAlert } from 'lucide-react'
import Button from '@/components/ui/Button'
import { adminVerifyAuditChainAction } from '@/app/actions/admin'

type Result = { ok: boolean; valid?: boolean; count?: number; brokenAtSeq?: number; error?: string }

// Rulează verificarea lanțului de audit (tamper-evidence) și afișează rezultatul.
export default function AuditVerifyCard() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, startTransition] = useTransition()

  const run = () =>
    startTransition(async () => {
      const res = await adminVerifyAuditChainAction()
      if (res.ok) setResult({ ok: true, valid: res.valid, count: res.count, brokenAtSeq: res.brokenAtSeq })
      else setResult({ ok: false, error: res.error })
    })

  return (
    <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <h2 className="text-xl font-semibold">Jurnal de audit</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Verifică integritatea lanțului inviolabil de evenimente (semnături, plăți, modificări).
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button type="button" loading={loading} onClick={run} className="px-5 py-2.5 text-sm">
          Verifică integritatea
        </Button>
        {result ? (
          result.ok ? (
            result.brokenAtSeq ? (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                <ShieldAlert size={16} /> Lanț compromis la poziția #{result.brokenAtSeq}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={16} /> Integru — {result.count} intrări verificate
              </span>
            )
          ) : (
            <span className="text-sm text-red-600 dark:text-red-400">{result.error}</span>
          )
        ) : null}
      </div>
    </div>
  )
}
