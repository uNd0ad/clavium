'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { createTicketAction } from '@/app/actions/tickets'
import type { TicketableContract } from '@/lib/dashboardData'

const selectClass =
  'w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] text-[var(--text)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(0,113,227,0.16)]'

const CATEGORIES = [
  { value: 'MENTENANTA', label: 'Mentenanță' },
  { value: 'PLATA', label: 'Plată' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'ALTELE', label: 'Altele' },
]

const PRIORITIES = [
  { value: 'SCAZUTA', label: 'Scăzută' },
  { value: 'NORMALA', label: 'Normală' },
  { value: 'URGENTA', label: 'Urgentă' },
]

// Chiriașul deschide un tichet pe unul dintre contractele sale de închiriere active.
export default function NewTicketForm({ contracts }: { contracts: TicketableContract[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [contractId, setContractId] = useState(contracts[0]?.id ?? '')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('MENTENANTA')
  const [priority, setPriority] = useState('NORMALA')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setSubject('')
    setCategory('MENTENANTA')
    setPriority('NORMALA')
    setMessage('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const res = await createTicketAction({ contractId, subject, category, priority, message })
    if (res.ok) {
      toast.success('Tichetul a fost deschis.')
      reset()
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="px-6 py-3 text-[13px]">
        <Plus size={15} /> Deschide un tichet
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="step-transition space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="text-lg font-semibold">Deschide un tichet</h3>

      <label className="block text-sm">
        <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Contract</span>
        <select value={contractId} onChange={(e) => setContractId(e.target.value)} className={selectClass} required>
          {contracts.map((contract) => (
            <option key={contract.id} value={contract.id}>
              {contract.label}
            </option>
          ))}
        </select>
      </label>

      <FormField
        label="Subiect"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Ex: Boilerul nu mai face apă caldă"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Categorie</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Prioritate</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
            {PRIORITIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Descrierea problemei</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] outline-none transition focus:border-[var(--brand)]"
          placeholder="Descrie pe scurt problema, când a apărut și orice detaliu util pentru proprietar."
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading} className="px-6 py-3 text-[13px]">
          Trimite tichetul
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="px-6 py-3 text-[13px]">
          Renunță
        </Button>
      </div>
    </form>
  )
}
