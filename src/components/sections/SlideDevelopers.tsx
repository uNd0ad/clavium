'use client'

import { Building, Briefcase, Store, ArrowRight } from 'lucide-react'
import SlideShell from './SlideShell'
import { useDict } from '@/lib/i18n/client'
import { SUPPORT_EMAIL } from '@/lib/services'

// Slide 3 — dezvoltatori & spații comerciale (B2B). Trei direcții: ansambluri rezidențiale,
// spații de birouri pentru companii, spații comerciale. CTA de tip lead (e-mail vânzări/demo).
const DEMO_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Solicitare demo — dezvoltatori & spații comerciale')}`

export default function SlideDevelopers() {
  const dict = useDict()
  const t = dict.home.developers

  const threads = [
    { icon: Building, title: t.bulkTitle, desc: t.bulkDesc },
    { icon: Briefcase, title: t.officeTitle, desc: t.officeDesc },
    { icon: Store, title: t.commercialTitle, desc: t.commercialDesc },
  ]

  return (
    <SlideShell id="dezvoltatori" className="bg-[var(--bg)]">
      <div className="max-w-3xl">
        <div className="section-label mb-5">{t.eyebrow}</div>
        <h2 className="font-sans text-[clamp(32px,4.5vw,56px)] font-semibold leading-tight tracking-[-0.03em] text-[var(--text)]">
          {t.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">{t.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {threads.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="surface-card flex flex-col rounded-4xl border border-[var(--border)] p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[var(--text)]">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <a href={DEMO_MAILTO} className="btn-primary px-8 py-4 text-sm">
          {t.cta} <ArrowRight size={16} />
        </a>
      </div>
    </SlideShell>
  )
}
