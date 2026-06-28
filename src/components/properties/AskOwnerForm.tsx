'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import { sendInquiryAction } from '@/app/actions/inquiries'

// Formularul prin care un utilizator interesat întreabă proprietarul despre listare (pre-contract).
export default function AskOwnerForm({
  propertyId,
  isAuthenticated,
  isOwner,
}: {
  propertyId: string
  isAuthenticated: boolean
  isOwner: boolean
}) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [loading, startTransition] = useTransition()

  // Proprietarul nu se întreabă pe sine.
  if (isOwner) return null

  const submit = () =>
    startTransition(async () => {
      const res = await sendInquiryAction(propertyId, body)
      if (res.ok) {
        toast.success('Întrebarea a fost trimisă proprietarului.', {
          action: { label: 'Vezi conversația', onClick: () => router.push(`/dashboard/mesaje/${res.inquiryId}`) },
        })
        setBody('')
      } else {
        toast.error(res.error)
      }
    })

  return (
    <div className="mt-4 rounded-4xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <MessageCircle size={18} className="text-[var(--brand)]" /> Întreabă proprietarul
      </h2>
      {isAuthenticated ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Ex: este disponibilă pentru vizionare în acest weekend?"
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
          />
          <Button type="button" loading={loading} onClick={submit} disabled={!body.trim()} className="px-5 py-2.5 text-sm">
            Trimite întrebarea
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--muted)]">
          <Link href="/auth/login" className="font-semibold text-[var(--brand)]">
            Autentifică-te
          </Link>{' '}
          pentru a trimite o întrebare proprietarului.
        </p>
      )}
    </div>
  )
}
