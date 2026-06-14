'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { setContractTermsAction } from '@/app/actions/contracts'

type Terms = { rent: number; deposit: number; months: number; dueDay: number; startDate: string; clauses: string }

// Editarea termenilor contractului de către proprietar (înainte de semnare).
export default function ContractTermsForm({ contractId, terms }: { contractId: string; terms: Terms }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rent, setRent] = useState(String(terms.rent))
  const [deposit, setDeposit] = useState(String(terms.deposit))
  const [months, setMonths] = useState(String(terms.months))
  const [dueDay, setDueDay] = useState(String(terms.dueDay))
  const [startDate, setStartDate] = useState(terms.startDate)
  const [clauses, setClauses] = useState(terms.clauses)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const res = await setContractTermsAction(contractId, { rent, deposit, months, dueDay, startDate, clauses })
    if (res.ok) {
      toast.success('Termenii contractului au fost actualizați.')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" onClick={() => setOpen(true)} className="px-5 py-2.5 text-[12px]">
        <Pencil size={14} /> Editează termenii
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="step-transition space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">Termenii contractului</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Chirie (RON / lună)" type="number" min={1} value={rent} onChange={(e) => setRent(e.target.value)} required />
        <FormField label="Garanție (RON)" type="number" min={0} value={deposit} onChange={(e) => setDeposit(e.target.value)} required />
        <FormField label="Durată (luni)" type="number" min={1} max={120} value={months} onChange={(e) => setMonths(e.target.value)} required />
        <FormField label="Zi scadență (1–28)" type="number" min={1} max={28} value={dueDay} onChange={(e) => setDueDay(e.target.value)} required />
        <FormField label="Dată început" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </div>
      <label className="block text-sm">
        <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Clauze speciale (opțional)</span>
        <textarea
          value={clauses}
          onChange={(e) => setClauses(e.target.value)}
          rows={4}
          className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] outline-none transition focus:border-[var(--brand)]"
          placeholder="Ex: animalele de companie sunt permise; întreținerea cade în sarcina chiriașului…"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading} className="px-6 py-3 text-[13px]">
          Salvează termenii
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="px-6 py-3 text-[13px]">
          Renunță
        </Button>
      </div>
    </form>
  )
}
