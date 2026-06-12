'use client'

import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="section-label">Eroare</p>
      <h1 className="mt-6 text-4xl font-semibold">A apărut o problemă</h1>
      <p className="mt-4 max-w-md text-[15px] leading-7 text-[var(--muted)]">
        Ne pare rău, ceva nu a funcționat. Încearcă din nou sau revino mai târziu.
        {error.digest ? <span className="mt-2 block text-xs">Cod: {error.digest}</span> : null}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button onClick={reset} className="btn-primary px-8 py-4 text-[13px]">Încearcă din nou</button>
        <Link href="/" className="btn-outline px-8 py-4 text-[13px]">Înapoi acasă</Link>
      </div>
    </main>
  )
}
