import Link from 'next/link'

type EmptyStateProps = {
  message: string
  cta?: { label: string; href: string }
  className?: string
}

// Stare goală cu acțiune de recuperare — transformă un capăt de drum într-un pas următor.
export default function EmptyState({ message, cta, className = '' }: EmptyStateProps) {
  return (
    <div className={`rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)] ${className}`}>
      <p>{message}</p>
      {cta ? (
        <Link href={cta.href} className="mt-3 inline-flex font-semibold text-[var(--brand)]">
          {cta.label} →
        </Link>
      ) : null}
    </div>
  )
}
