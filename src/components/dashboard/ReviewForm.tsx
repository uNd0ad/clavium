'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import clsx from 'clsx'
import Button from '@/components/ui/Button'
import { createReviewAction } from '@/app/actions/reviews'

// Formular de recenzie pentru cealaltă parte a unui contract încheiat.
export default function ReviewForm({ contractId, subjectName }: { contractId: string; subjectName: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, startTransition] = useTransition()

  const submit = () =>
    startTransition(async () => {
      const res = await createReviewAction(contractId, rating, comment.trim() || undefined)
      if (res.ok) {
        toast.success('Recenzie trimisă. Mulțumim!')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  return (
    <div className="space-y-4 rounded-4xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div>
        <h3 className="text-lg font-semibold">Evaluează: {subjectName}</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">Experiența ta ajută comunitatea Clavium.</p>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
            aria-label={`${i} stele`}
            className="p-0.5"
          >
            <Star size={28} className={clsx('transition', i <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-[var(--border)]')} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Comentariu (opțional)…"
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
      />
      <Button type="button" loading={loading} onClick={submit} disabled={rating < 1} className="px-5 py-2.5 text-sm">
        Trimite recenzia
      </Button>
    </div>
  )
}
