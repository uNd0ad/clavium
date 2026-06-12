'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'

export default function PhotoManager({ propertyId, photos }: { propertyId: string; photos: string[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      Array.from(files).forEach((file) => form.append('photos', file))
      const response = await fetch(`/api/properties/${propertyId}/photos`, { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = async (url: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/properties/${propertyId}/photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        {photos.map((url) => (
          <div key={url} className="group relative h-16 w-20 overflow-hidden rounded-xl border border-[var(--border)]">
            <Image src={url} alt="Fotografie proprietate" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              disabled={loading}
              aria-label="Șterge fotografia"
              className="absolute right-1 top-1 hidden rounded-full bg-white/90 p-0.5 text-rose-700 shadow group-hover:block"
            >
              <X size={13} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] text-[11px] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ImagePlus size={16} />
          {loading ? '...' : 'Foto'}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={upload} />
      </div>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}
