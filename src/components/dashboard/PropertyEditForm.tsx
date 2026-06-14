'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { updatePropertyAction } from '@/app/actions/properties'

type PropertyEditFormProps = {
  propertyId: string
  title: string
  location: string
  transactionType: 'INCHIRIERE' | 'VANZARE'
  rent: number
  price: number
  rooms: number | null
  surface: number | null
  description: string
}

// Editare inline a detaliilor unei proprietăți, pre-completată cu valorile curente.
export default function PropertyEditForm({ propertyId, title: t0, location: l0, transactionType, rent: r0, price: p0, rooms: rm0, surface: s0, description: d0 }: PropertyEditFormProps) {
  const router = useRouter()
  const isSale = transactionType === 'VANZARE'
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(t0)
  const [location, setLocation] = useState(l0)
  const [rent, setRent] = useState(String(r0))
  const [price, setPrice] = useState(String(p0))
  const [rooms, setRooms] = useState(rm0 ? String(rm0) : '')
  const [surface, setSurface] = useState(s0 ? String(s0) : '')
  const [description, setDescription] = useState(d0)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const res = await updatePropertyAction(propertyId, {
      title,
      location,
      transactionType,
      ...(isSale ? { price } : { rent }),
      rooms: rooms || undefined,
      surface: surface || undefined,
      description: description || undefined,
    })
    if (res.ok) {
      toast.success('Proprietate actualizată.')
      setOpen(false)
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-[12px] font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
      >
        <Pencil size={13} /> Editează
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="step-transition mt-3 space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
      <FormField label="Titlu" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Localitate" value={location} onChange={(e) => setLocation(e.target.value)} required />
        {isSale ? (
          <FormField label="Preț de vânzare (RON)" type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} required />
        ) : (
          <FormField label="Chirie (RON / lună)" type="number" min={1} value={rent} onChange={(e) => setRent(e.target.value)} required />
        )}
        <FormField label="Camere (opțional)" type="number" min={1} value={rooms} onChange={(e) => setRooms(e.target.value)} />
        <FormField label="Suprafață m² (opțional)" type="number" min={1} value={surface} onChange={(e) => setSurface(e.target.value)} />
      </div>
      <label className="block text-sm">
        <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Descriere (opțional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] outline-none transition focus:border-[var(--brand)]"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={loading} className="px-6 py-3 text-[13px]">
          Salvează
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="px-6 py-3 text-[13px]">
          Renunță
        </Button>
      </div>
    </form>
  )
}
