'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Undo2, XCircle, CalendarClock, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import FormField from '@/components/ui/FormField'
import { returnDepositAction, cancelSaleAction, terminateContractAction, renewContractAction } from '@/app/actions/contracts'

const ronFmt = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 })

// Restituirea garanției la finalul închirierii, cu posibile rețineri pentru daune (proprietar).
export function DepositReturnForm({ contractId, deposit }: { contractId: string; deposit: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deduction, setDeduction] = useState('0')
  const [reason, setReason] = useState('')
  const [loading, startTransition] = useTransition()

  const deductionNum = Math.min(Math.max(Number(deduction) || 0, 0), deposit)
  const returned = deposit - deductionNum

  const submit = () =>
    startTransition(async () => {
      const res = await returnDepositAction(contractId, { deduction: deductionNum, reason: reason.trim() || undefined })
      if (res.ok) {
        toast.success('Garanția a fost procesată.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="px-5 py-2.5 text-xs">
        <Undo2 size={14} /> Restituie garanția
      </Button>
    )
  }

  return (
    <div className="step-transition space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">Restituirea garanției ({ronFmt.format(deposit)})</h3>
      <FormField
        label="Rețineri pentru daune (RON)"
        type="number"
        min={0}
        max={deposit}
        value={deduction}
        onChange={(e) => setDeduction(e.target.value)}
      />
      <label className="block text-sm">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Motivul reținerii (opțional)</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          placeholder="Ex: reparații, curățenie, obiecte lipsă…"
        />
      </label>
      <p className="text-sm text-[var(--muted)]">
        Se restituie chiriașului: <span className="font-semibold text-[var(--text)]">{ronFmt.format(returned)}</span>
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" loading={loading} onClick={submit} className="px-6 py-3 text-sm">
          Confirmă restituirea
        </Button>
        <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="px-6 py-3 text-sm">
          Renunță
        </Button>
      </div>
    </div>
  )
}

// Anularea antecontractului de vânzare (aplică regulile arvunei).
export function CancelSaleButton({ contractId }: { contractId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, startTransition] = useTransition()

  const submit = () =>
    startTransition(async () => {
      const res = await cancelSaleAction(contractId, { reason: reason.trim() || undefined })
      if (res.ok) {
        toast.success('Antecontractul a fost anulat.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="px-5 py-2.5 text-xs">
        <XCircle size={14} /> Anulează antecontractul
      </Button>
    )
  }

  return (
    <div className="step-transition space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">Anularea antecontractului</h3>
      <p className="text-sm text-[var(--muted)]">
        Atenție: dacă arvuna a fost plătită, retragerea cumpărătorului duce la pierderea ei, iar retragerea
        vânzătorului îl obligă la restituirea dublului arvunei (Cod civil, art. 1544).
      </p>
      <label className="block text-sm">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Motiv (opțional)</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" loading={loading} onClick={submit} className="px-6 py-3 text-sm">
          Confirmă anularea
        </Button>
        <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="px-6 py-3 text-sm">
          Renunță
        </Button>
      </div>
    </div>
  )
}

// Rezilierea anticipată a unei închirieri active (oricare parte).
export function TerminateButton({ contractId }: { contractId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, startTransition] = useTransition()

  const submit = () =>
    startTransition(async () => {
      const res = await terminateContractAction(contractId, { reason: reason.trim() || undefined })
      if (res.ok) {
        toast.success('Contractul a fost reziliat.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="px-5 py-2.5 text-xs">
        <CalendarClock size={14} /> Reziliază contractul
      </Button>
    )
  }

  return (
    <div className="step-transition space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">Rezilierea contractului</h3>
      <p className="text-sm text-[var(--muted)]">
        Contractul se încheie anticipat, chiriile viitoare se anulează, iar listarea redevine disponibilă.
        Garanția se restituie separat, după reziliere.
      </p>
      <label className="block text-sm">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Motiv (opțional)</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" loading={loading} onClick={submit} className="px-6 py-3 text-sm">
          Confirmă rezilierea
        </Button>
        <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="px-6 py-3 text-sm">
          Renunță
        </Button>
      </div>
    </div>
  )
}

// Reînnoirea unei închirieri încheiate (proprietar) — creează un contract nou de semnat.
export function RenewForm({ contractId, defaultMonths, defaultRent }: { contractId: string; defaultMonths: number; defaultRent: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [months, setMonths] = useState(String(defaultMonths || 12))
  const [rent, setRent] = useState(String(defaultRent || 0))
  const [loading, startTransition] = useTransition()

  const submit = () =>
    startTransition(async () => {
      const res = await renewContractAction(contractId, { months: Number(months) || undefined, rent: Number(rent) || undefined })
      if (res.ok) {
        toast.success('Contract de reînnoire creat — necesită semnături.')
        setOpen(false)
        if (res.contractId) router.push(`/dashboard/contracte/${res.contractId}`)
        else router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="px-5 py-2.5 text-xs">
        <RefreshCw size={14} /> Reînnoiește / modifică
      </Button>
    )
  }

  return (
    <div className="step-transition space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">Reînnoirea închirierii</h3>
      <p className="text-sm text-[var(--muted)]">
        Se creează un contract nou (cu termenii de mai jos) care trebuie semnat din nou de ambele părți.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Durată (luni)" type="number" min={1} value={months} onChange={(e) => setMonths(e.target.value)} />
        <FormField label="Chirie lunară (RON)" type="number" min={1} value={rent} onChange={(e) => setRent(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" loading={loading} onClick={submit} className="px-6 py-3 text-sm">
          Creează reînnoirea
        </Button>
        <Button type="button" variant="outline" disabled={loading} onClick={() => setOpen(false)} className="px-6 py-3 text-sm">
          Renunță
        </Button>
      </div>
    </div>
  )
}
