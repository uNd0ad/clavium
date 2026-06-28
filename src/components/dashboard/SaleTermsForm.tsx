'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { setSaleTermsAction } from '@/app/actions/contracts'
import { saleCommission, saleCommissionRate } from '@/lib/commission'

type SaleTerms = { price: number; deposit: number; clauses: string }

const ronFmt = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 })

// Editarea termenilor antecontractului de vânzare de către vânzător (înainte de semnare).
export default function SaleTermsForm({ contractId, terms }: { contractId: string; terms: SaleTerms }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [price, setPrice] = useState(String(terms.price))
  const [deposit, setDeposit] = useState(String(terms.deposit))
  const [clauses, setClauses] = useState(terms.clauses)
  const [loading, setLoading] = useState(false)

  // Estimarea comisionului platformei (degresiv), afișată în timp real vânzătorului.
  const priceNum = Number(price)
  const commission = Number.isFinite(priceNum) && priceNum > 0 ? saleCommission(priceNum) : 0
  const commissionPct = priceNum > 0 ? (saleCommissionRate(priceNum) * 100).toFixed(2) : '0'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const res = await setSaleTermsAction(contractId, { price, deposit, clauses })
    if (res.ok) {
      toast.success('Termenii antecontractului au fost actualizați.')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="px-5 py-2.5 text-xs">
        <Pencil size={14} /> Editează termenii
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="step-transition space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">Termenii antecontractului</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Preț de vânzare (RON)" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
        <FormField label="Avans / arvună (RON)" type="number" min={0} value={deposit} onChange={(e) => setDeposit(e.target.value)} required />
      </div>
      {commission > 0 ? (
        <p className="rounded-2xl bg-[var(--muted-bg,rgba(0,0,0,0.03))] px-4 py-3 text-sm text-[var(--muted)]">
          Comision estimat al platformei la finalizarea vânzării:{' '}
          <span className="font-semibold text-[var(--text)]">{ronFmt.format(commission)}</span>{' '}
          (~{commissionPct}% din preț). Se reține din contul tău doar după încasarea integrală a prețului.
        </p>
      ) : null}
      <label className="block text-sm">
        <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Clauze speciale (opțional)</span>
        <textarea
          value={clauses}
          onChange={(e) => setClauses(e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          placeholder="Ex: termenul de încheiere la notar; cine suportă taxele notariale…"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading} className="px-6 py-3 text-sm">
          Salvează termenii
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="px-6 py-3 text-sm">
          Renunță
        </Button>
      </div>
    </form>
  )
}
