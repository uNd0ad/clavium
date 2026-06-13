'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bookmark, BookmarkCheck, Send } from 'lucide-react'

// Acțiuni compacte pe cardul din listă: salvare + ofertă rapidă.
export default function ListingActions({ propertyId, initialSaved, canOffer }: { propertyId: string; initialSaved: boolean; canOffer: boolean }) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleSave = async () => {
    // Optimist: schimbăm starea imediat și revenim dacă cererea eșuează.
    const previous = saved
    const next = !saved
    setSaved(next)
    setLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/save`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setSaved(data.saved)
      toast.success(data.saved ? 'Proprietate salvată.' : 'Eliminată din salvate.')
      router.refresh()
    } catch (error) {
      setSaved(previous)
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const sendOffer = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, amount: Number(amount) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      toast.success('Ofertă trimisă! Proprietarul a fost notificat.')
      setAmount('')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[12px] font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          {saved ? <BookmarkCheck size={14} className="text-[var(--brand)]" /> : <Bookmark size={14} />}
          {saved ? 'Salvată' : 'Salvează'}
        </button>
        {canOffer ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="RON / lună"
              className="w-full min-w-0 flex-1 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[12px] outline-none transition focus:border-[var(--brand)]"
            />
            <button
              type="button"
              onClick={sendOffer}
              disabled={loading || !amount}
              className="btn-primary shrink-0 px-4 py-2 text-[11px]"
            >
              <Send size={13} /> Ofertă
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
