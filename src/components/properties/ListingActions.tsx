'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Bookmark, BookmarkCheck, Send } from 'lucide-react'
import { toggleSaveAction } from '@/app/actions/properties'
import { createOfferAction } from '@/app/actions/offers'

// Acțiuni compacte pe cardul din listă: salvare + ofertă rapidă.
export default function ListingActions({ propertyId, initialSaved, canOffer }: { propertyId: string; initialSaved: boolean; canOffer: boolean }) {
  const [saved, setSaved] = useState(initialSaved)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleSave = async () => {
    // Optimist: schimbăm starea imediat și revenim dacă cererea eșuează.
    const previous = saved
    setSaved(!saved)
    setLoading(true)
    const res = await toggleSaveAction(propertyId)
    if (res.ok) {
      setSaved(res.saved)
      toast.success(res.saved ? 'Proprietate salvată.' : 'Eliminată din salvate.')
    } else {
      setSaved(previous)
      toast.error(res.error)
    }
    setLoading(false)
  }

  const sendOffer = async () => {
    setLoading(true)
    const res = await createOfferAction({ propertyId, amount: Number(amount) })
    if (res.ok) {
      toast.success('Ofertă trimisă! Proprietarul a fost notificat.')
      setAmount('')
    } else {
      toast.error(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleSave}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[12px] font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
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
              className="w-full min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[12px] outline-none transition focus:border-[var(--brand)]"
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
