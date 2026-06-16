'use client'

import { Search, Handshake, FileText, PenLine } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

const STEPS = [
  {
    num: '01',
    icon: Search,
    title: 'Găsești proprietatea',
    desc: 'Cauți după locație, tip și buget. Listingurile afișează informații verificate și ușor de comparat.',
    detail: 'Filtre rapide · Hartă clară',
  },
  {
    num: '02',
    icon: Handshake,
    title: 'Negociezi direct',
    desc: 'Trimite oferta către proprietar și urmărește progresul direct din contul tău.',
    detail: 'Mesagerie sigură · Istoric transparent',
  },
  {
    num: '03',
    icon: FileText,
    title: 'Generezi contractul',
    desc: 'Contractul se construiește automat din termeni agreați și este gata pentru semnare electronică.',
    detail: 'Template juridic · Preview instant',
  },
  {
    num: '04',
    icon: PenLine,
    title: 'Semnezi digital',
    desc: 'Semnătura electronică calificată validează contractul fără deplasări la notar.',
    detail: 'QES eIDAS · Descărcare PDF',
  },
]

export default function HowItWorksSection() {
  const ref = useReveal()

  return (
    <section id="cum-functioneaza" className="bg-[var(--bg)] py-24 lg:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-16 reveal">
          <div className="section-label mb-5">Procesul</div>
          <div className="max-w-4xl">
            <h2 className="font-sans text-[clamp(34px,4vw,50px)] font-semibold tracking-[-0.03em] text-[var(--text)] leading-tight">
              De la căutare la contract,
              <br />
              <span className="text-[var(--brand)]">fără efort inutil.</span>
            </h2>
            <p className="mt-5 text-base text-[var(--muted)] max-w-2xl leading-8">
              Totul a fost simplificat pentru a oferi o experiență premium: structură clară, etape vizibile și rezultate rapide.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ num, icon: Icon, title, desc, detail }, i) => (
            <div key={num} className={`surface-card rounded-4xl p-8 border border-[var(--border)] reveal reveal-delay-${i + 1}`}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-[var(--brand)] mb-6">
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <p className="text-2xs uppercase tracking-[0.22em] text-[var(--muted)] mb-3">
                Pasul {num}
              </p>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
                {title}
              </h3>
              <p className="text-sm text-[var(--muted)] leading-7 mb-5">
                {desc}
              </p>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                {detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
