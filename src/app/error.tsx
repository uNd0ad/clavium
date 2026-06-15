'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { RotateCcw, Home, TriangleAlert } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Logăm eroarea în consolă pentru diagnosticare (în producție ar merge într-un serviciu de monitorizare).
    console.error(error)
  }, [error])

  return (
    <>
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,113,227,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(0,113,227,0.12),_transparent_30%)] opacity-95" />

        <div className="page-transition relative w-full max-w-xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-4xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <TriangleAlert size={44} strokeWidth={1.6} />
          </div>

          <div className="section-label mt-8 justify-center">A apărut o problemă</div>

          <h1 className="mt-6 text-[clamp(28px,5vw,44px)] font-semibold tracking-[-0.03em] text-[var(--text)]">
            Ceva nu a funcționat
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
            Ne pare rău, a intervenit o eroare neașteptată. Încearcă din nou — dacă problema persistă, revino mai târziu.
          </p>

          {error.digest ? (
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Cod eroare: {error.digest}</p>
          ) : null}

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <button onClick={reset} className="btn-primary px-8 py-4">
              <RotateCcw size={16} /> Încearcă din nou
            </button>
            <Link href="/" className="btn-outline px-8 py-4">
              <Home size={16} /> Înapoi acasă
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
