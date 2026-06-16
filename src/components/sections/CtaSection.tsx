'use client'

import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import { ArrowRight } from 'lucide-react'

export default function CtaSection() {
  const ref = useReveal()

  return (
    <section className="bg-[var(--brand-soft)] py-24 lg:py-28" ref={ref}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
        <div className="reveal mb-10 inline-flex items-center justify-center gap-3 rounded-full border border-[var(--brand)]/20 bg-[var(--card)] px-5 py-2 text-xs uppercase tracking-[0.18em] text-[var(--brand)]">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)] animate-pulse" />
          Disponibil acum · Înregistrare gratuită
        </div>

        <h2 className="reveal reveal-delay-1 font-sans text-[clamp(38px,5vw,64px)] font-semibold tracking-[-0.03em] text-[var(--text)] leading-tight mb-6">
          Imobiliare moderne,
          <br />
          <span className="text-[var(--brand)]">fără compromisuri.</span>
        </h2>

        <p className="reveal reveal-delay-2 mx-auto max-w-2xl text-base text-[var(--muted)] leading-8 mb-10">
          Creează-ți contul gratuit și accesează listări, negociere și contracte într-o platformă construită pentru transparență și viteză.
        </p>

        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full">
          <a href="/auth/register" className="btn-primary px-10 py-4 text-sm w-full sm:w-auto justify-center">
            Creează cont gratuit
            <ArrowRight size={16} />
          </a>
          <Link href="/proprietati" className="btn-outline px-10 py-4 text-sm w-full sm:w-auto justify-center">
            Explorează proprietăți
            <ArrowRight size={16} />
          </Link>
        </div>

        <p className="reveal reveal-delay-4 text-xs text-[var(--muted)] tracking-[0.16em] uppercase">
          Fără card de credit · Fără abonament · Plătești doar la tranzacție reușită
        </p>
      </div>
    </section>
  )
}
