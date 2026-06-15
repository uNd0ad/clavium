import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type EmptyStateProps = {
  message: string
  cta?: { label: string; href: string }
  className?: string
}

// Stare goală cu acțiune de recuperare — transformă un capăt de drum într-un pas următor.
export default function EmptyState({ message, cta, className = '' }: EmptyStateProps) {
  return (
    <div className={`rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)] ${className}`}>
      <p>{message}</p>
      {cta ? (
        <Link href={cta.href} className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[var(--brand)]">
          {cta.label}
          <ArrowRight size={15} />
        </Link>
      ) : null}
    </div>
  )
}
