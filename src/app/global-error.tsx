'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { reportException } from '@/lib/sentry'
// global-error înlocuiește complet root layout-ul, deci trebuie să-și aducă singur stilurile
// (tokenii din :root și clasele utilitare .section-label / .btn-primary) și propriile <html>/<body>.
import './globals.css'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportException(error, { boundary: 'global', digest: error.digest })
  }, [error])

  return (
    <html lang="ro">
      <body>
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,113,227,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(0,113,227,0.12),_transparent_30%)] opacity-95" />

          <div className="relative w-full max-w-xl">
            <p className="mb-8 select-none text-2xl font-semibold text-[var(--text)]">
              Clavium<span className="italic text-[var(--brand)]">.ro</span>
            </p>

            <div className="section-label justify-center">A apărut o problemă</div>

            <h1 className="mt-6 text-[clamp(28px,5vw,44px)] font-semibold tracking-[-0.03em] text-[var(--text)]">
              Aplicația a întâmpinat o eroare
            </h1>

            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[var(--muted)]">
              Ne pare rău, ceva nu a funcționat. Reîncarcă pagina — dacă problema persistă, revino mai târziu.
            </p>

            {error.digest ? (
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Cod eroare: {error.digest}</p>
            ) : null}

            <div className="mt-9 flex justify-center">
              <button onClick={reset} className="btn-primary px-8 py-4">
                <RotateCcw size={16} /> Reîncarcă aplicația
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
