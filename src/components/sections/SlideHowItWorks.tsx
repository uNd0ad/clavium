'use client'

import Link from 'next/link'
import { Search, Handshake, FileText, PenLine, ArrowRight } from 'lucide-react'
import SlideShell from './SlideShell'
import { useDict } from '@/lib/i18n/client'

const STEP_ICONS = [Search, Handshake, FileText, PenLine]

// Slide 4 — cum funcționează: proces în 4 pași + CTA de închidere.
export default function SlideHowItWorks() {
  const dict = useDict()
  const t = dict.home.how

  return (
    <SlideShell id="cum-functioneaza" className="bg-[var(--surface-strong)]">
      <div className="max-w-3xl">
        <div className="section-label mb-5">{t.eyebrow}</div>
        <h2 className="font-sans text-[clamp(32px,4.5vw,56px)] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
          {t.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{t.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {t.steps.map((step, i) => {
          const Icon = STEP_ICONS[i] ?? Search
          return (
            <div key={step.title} className="surface-card rounded-4xl border border-[var(--border)] p-7">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <p className="mt-5 text-2xs uppercase tracking-[0.22em] text-[var(--muted)]">{`0${i + 1}`}</p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{step.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/auth/register" className="btn-primary px-8 py-4 text-sm">
          {t.ctaPrimary} <ArrowRight size={16} />
        </Link>
        <Link href="/proprietati" className="btn-outline px-8 py-4 text-sm">
          {t.ctaSecondary} <ArrowRight size={16} />
        </Link>
      </div>
    </SlideShell>
  )
}
