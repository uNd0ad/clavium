'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

type PropertyActionsProps = {
  propertyId: string
  initialSaved: boolean
  isAuthenticated: boolean
  canOffer: boolean
  available: boolean
}

export default function PropertyActions({ propertyId, initialSaved, isAuthenticated, canOffer, available }: PropertyActionsProps) {
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
    try {
      const response = await fetch(`/api/properties/${propertyId}/save`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setSaved(data.saved)
      toast.success(data.saved ? 'Proprietate salvată.' : 'Eliminată din salvate.')
    } catch (error) {
      setSaved(previous)
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleOffer = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
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
    <div className="space-y-5 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
      <Button type="button" variant="outline" loading={loading} onClick={handleSave} className="w-full py-4 text-[14px]">
        {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        {saved ? 'Salvată' : 'Salvează proprietatea'}
      </Button>

      {canOffer && available ? (
        <div className="space-y-4">
          <FormField
            label="Oferta ta (RON / lună)"
            type="number"
            min={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1800"
          />
          <Button type="button" loading={loading} disabled={!amount} onClick={handleOffer} className="w-full py-4 text-[14px]">
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
