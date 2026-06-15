'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import { toggleSaveAction } from '@/app/actions/properties'
import { createOfferAction } from '@/app/actions/offers'

type PropertyActionsProps = {
  propertyId: string
  initialSaved: boolean
  isAuthenticated: boolean
  canOffer: boolean
  available: boolean
  transactionType?: 'INCHIRIERE' | 'VANZARE'
}

export default function PropertyActions({ propertyId, initialSaved, isAuthenticated, canOffer, available, transactionType = 'INCHIRIERE' }: PropertyActionsProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
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

  const handleOffer = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
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
    <div className="space-y-5 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
      <Button type="button" variant="outline" loading={loading} onClick={handleSave} className="w-full py-4 text-sm">
        {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        {saved ? 'Salvată' : 'Salvează proprietatea'}
      </Button>

      {canOffer && available ? (
        <div className="space-y-4">
          <FormField
            label={transactionType === 'VANZARE' ? 'Oferta ta (RON)' : 'Oferta ta (RON / lună)'}
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={transactionType === 'VANZARE' ? '250000' : '1800'}
          />
          <Button type="button" loading={loading} disabled={!amount} onClick={handleOffer} className="w-full py-4 text-sm">
            Trimite oferta
          </Button>
        </div>
      ) : null}

      {!available ? (
        <p className="text-sm text-[var(--muted)]">Această proprietate nu este disponibilă momentan.</p>
      ) : null}

      {!isAuthenticated ? (
        <p className="text-sm text-[var(--muted)]">
          <a href="/auth/login" className="font-semibold text-[var(--brand)]">Autentifică-te</a> pentru a salva sau a trimite o ofertă.
        </p>
      ) : null}
    </div>
  )
}
