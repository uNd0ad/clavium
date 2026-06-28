import { Star } from 'lucide-react'

// Afișaj read-only al unei note (1–5) cu stele pline/goale.
export default function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} din 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-[var(--border)]'}
        />
      ))}
    </span>
  )
}
