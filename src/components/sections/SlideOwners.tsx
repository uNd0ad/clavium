'use client'

import Link from 'next/link'
import { ArrowRight, Check, Rocket, Building2 } from 'lucide-react'
import SlideShell from './SlideShell'
import { useDict } from '@/lib/i18n/client'

// Slide 2 — proprietari care vor să închirieze sau să vândă. Modelul dual: self-service vs.
// administrat de Vatrio. `services` = preview cu carduri de serviciu randate pe server (păstrează
// iconițele pe server, evitând trecerea de funcții peste granița server/client).
export default function SlideOwners({ services }: { services: React.ReactNode }) {
  const dict = useDict()
  const t = dict.home.owners

  return (
    <SlideShell id="proprietari" className="bg-[var(--surface-strong)]">
      <div className="max-w-3xl">
        <div className="section-label mb-5">{t.eyebrow}</div>
        <h2 className="font-sans text-[clamp(32px,4.5vw,56px)] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
          {t.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{t.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {/* Self-service */}
        <div className="surface-card flex flex-col rounded-4xl border border-[var(--border)] p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <Rocket size={22} strokeWidth={1.75} />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-[var(--text)]">{t.diyTitle}</h3>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">{t.diyDesc}</p>
          <ul className="mt-6 space-y-3">
            {t.diyBullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-[var(--text)]">
                <Check size={16} className="mt-0.5 shrink-0 text-[var(--brand)]" /> {b}
              </li>
            ))}
          </ul>
          <Link href="/auth/register" className="btn-primary mt-8 w-full justify-center">
            {t.diyCta} <ArrowRight size={16} />
          </Link>
        </div>

        {/* Administrat de Vatrio */}
        <div className="relative flex flex-col rounded-4xl border border-[var(--brand)]/30 bg-[var(--brand-soft)] p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--brand)] text-white">
            <Building2 size={22} strokeWidth={1.75} />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-[var(--text)]">{t.managedTitle}</h3>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">{t.managedDesc}</p>
          <ul className="mt-6 space-y-3">
            {t.managedBullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-[var(--text)]">
                <Check size={16} className="mt-0.5 shrink-0 text-[var(--brand)]" /> {b}
              </li>
            ))}
          </ul>
          <Link href="/servicii" className="btn-outline mt-8 w-full justify-center">
            {t.managedCta} <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Preview servicii */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">{services}</div>
    </SlideShell>
  )
}
