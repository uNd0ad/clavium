'use client'

import { Scale, BadgeCheck, Lock, ShieldCheck } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

const TRUST_ITEMS = [
  { value: 'Legea 214/2024', label: 'Semnătură electronică calificată', icon: Scale },
  { value: 'eIDAS', label: 'Standard european de autentificare', icon: BadgeCheck },
  { value: 'GDPR', label: 'Protecție completă a datelor', icon: Lock },
  { value: 'SSL 256-bit', label: 'Criptare end-to-end', icon: ShieldCheck },
]

export default function TrustBar() {
  const ref = useReveal()

  return (
    <div className="bg-[var(--surface-strong)] border-y border-[var(--border)]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[var(--border)]">
          {TRUST_ITEMS.map(({ value, label, icon: Icon }, i) => (
            <div key={value} className={`py-8 px-6 lg:px-10 flex items-start gap-4 reveal reveal-delay-${i + 1}`}>
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]" aria-hidden>
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <div>
                <div className="font-sans text-lg font-semibold text-[var(--text)] leading-tight">
                  {value}
                </div>
                <div className="text-sm text-[var(--muted)] leading-snug mt-1">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
