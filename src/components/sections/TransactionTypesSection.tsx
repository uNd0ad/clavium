'use client'

import { useReveal } from '@/hooks/useReveal'
import { ArrowRight } from 'lucide-react'

const TYPES = [
  {
    tag: 'Cel mai popular',
    name: 'Vânzare-Cumpărare',
    desc: 'Antecontract digital cu QES, pregătit să fie finalizat la notar fără hârtii în exces.',
    features: ['Antecontract instant', 'Dosar notarial complet', 'Legal și transparent'],
    href: '/vanzare',
  },
  {
    tag: 'Cel mai rapid',
    name: 'Închiriere',
    desc: 'Contract de locațiune semnat online, cu notificări și automatizări de plată disponibile.',
    features: ['Semnare digitală', 'Plăți automate', 'Reînnoire simplă'],
    href: '/inchiriere',
  },
  {
    tag: 'Nou pe piață',
    name: 'Leasing Imobiliar',
    desc: 'Leasing flexibil cu opțiune de cumpărare, pentru persoane fizice și companii.',
    features: ['Opțiune de cumpărare', 'Structură personalizabilă', 'Documentație clară'],
    href: '/leasing',
  },
]

export default function TransactionTypesSection() {
  const ref = useReveal()

  return (
    <section id="proprietati" className="bg-[var(--bg)] py-24 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-16">
          <div className="section-label mb-5">Tipuri de tranzacții</div>
          <h2 className="font-sans text-[clamp(34px,4vw,50px)] font-semibold tracking-[-0.03em] text-[var(--text)] leading-tight">
            Orice tranzacție imobiliară,
            <br />
            <span className="text-[var(--brand)]">gândită pentru viteză și claritate.</span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {TYPES.map((type) => (
            <a key={type.name} href={type.href} className="surface-card group rounded-4xl p-8 border border-[var(--border)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="h-1.5 w-12 rounded-full bg-[var(--brand)]/30" />
                <span className="text-2xs uppercase tracking-[0.24em] text-[var(--brand)] font-semibold">
                  {type.tag}
                </span>
              </div>

              <h3 className="font-semibold text-2xl text-[var(--text)] mb-4">
                {type.name}
              </h3>

              <p className="text-base text-[var(--muted)] leading-8 mb-8">
                {type.desc}
              </p>

              <ul className="space-y-3 mb-8">
                {type.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-[var(--text)]">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[var(--brand)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-[var(--brand)] font-semibold">
                Explorează
                <ArrowRight size={14} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
