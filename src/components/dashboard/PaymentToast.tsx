'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

// Afișează feedback după întoarcerea de pe Stripe Checkout (?plata=...) și curăță parametrul
// din URL, ca un refresh să nu repete mesajul.
const MESSAGES: Record<string, { type: 'success' | 'error' | 'info'; text: string }> = {
  succes: { type: 'success', text: 'Plata a fost efectuată cu succes.' },
  anulat: { type: 'info', text: 'Plata a fost anulată.' },
  in_asteptare: { type: 'info', text: 'Plata se procesează — vei vedea confirmarea în scurt timp.' },
  eroare: { type: 'error', text: 'Confirmarea plății a eșuat. Dacă ai fost taxat, plata se va concilia automat.' },
}

export default function PaymentToast() {
  const params = useSearchParams()
  const router = useRouter()
  const shown = useRef(false)

  useEffect(() => {
    const status = params.get('plata')
    if (!status || shown.current) return
    const msg = MESSAGES[status]
    if (msg) {
      shown.current = true
      toast[msg.type](msg.text)
      router.replace('/dashboard/contracte')
    }
  }, [params, router])

  return null
}
