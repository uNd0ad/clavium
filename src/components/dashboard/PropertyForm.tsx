'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ImagePlus } from 'lucide-react'
import FormField from '@/components/ui/FormField'

export default function PropertyForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [rent, setRent] = useState('')
  const [rooms, setRooms] = useState('')
  const [surface, setSurface] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const photosRef = useRef<HTMLInputElement>(null)
  const [photoCount, setPhotoCount] = useState(0)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setStatus('Se adaugă proprietatea...')

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location,
          rent: Number(rent),
          rooms: rooms ? Number(rooms) : undefined,
          surface: surface ? Number(surface) : undefined,
          description: description || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')

      const files = photosRef.current?.files
      if (files && files.length > 0) {
        setStatus('Se încarcă fotografiile...')
        const form = new FormData()
        Array.from(files).forEach((file) => form.append('photos', file))
        const photoResponse = await fetch(`/api/properties/${data.property.id}/photos`, { method: 'POST', body: form })
        if (!photoResponse.ok) {
          const photoData = await photoResponse.json().catch(() => ({}))
          setStatus(`Proprietatea a fost adăugată, dar fotografiile nu au putut fi încărcate: ${photoData.error ?? 'eroare'}`)
        }
      }

      setStatus('Proprietatea a fost adăugată!')
      setTitle(''); setLocation(''); setRent(''); setRooms(''); setSurface(''); setDescription('')
      setPhotoCount(0)
      setOpen(false)
      router.refresh()
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => setOpen(true)} className="btn-primary px-6 py-3 text-[13px]">
          <Plus size={16} /> Adaugă proprietate
        </button>
        {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="step-transition space-y-5 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
      <h2 className="text-xl font-semibold">Proprietate nouă</h2>
      <FormField label="Titlu" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Apartament 2 camere Dorobanți" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Localitate" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="București" required />
        <FormField label="Chirie (RON / lună)" type="number" min={1} value={rent} onChange={(e) => setRent(e.target.value)} placeholder="1800" required />
        <FormField label="Camere (opțional)" type="number" min={1} value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="2" />
        <FormField label="Suprafață m² (opțional)" type="number" min={1} value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="56" />
      </div>
      <label className="block text-sm">
        <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Descriere (opțional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 text-[14px] outline-none transition focus:border-[var(--brand)]"
          placeholder="Detalii despre proprietate..."
        />
      </label>
      <div>
        <button
          type="button"
          onClick={() => photosRef.current?.click()}
          className="flex items-center gap-2 rounded-[18px] border border-dashed border-[var(--border)] px-5 py-3 text-[13px] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ImagePlus size={16} />
          {photoCount > 0 ? `${photoCount} fotografii selectate` : 'Adaugă fotografii (max 8, JPEG/PNG/WebP, 5 MB)'}
        </button>
        <input
          ref={photosRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(event) => setPhotoCount(event.target.files?.length ?? 0)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3 text-[13px]">
          {loading ? 'Se salvează…' : 'Publică proprietatea'}
        </button>
        <button type="button" onClick={() => setOpen(false)} disabled={loading} className="btn-outline px-6 py-3 text-[13px]">
          Renunță
        </button>
      </div>
      {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
    </form>
  )
}
