'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useDict } from '@/lib/i18n/client'

// Valori stabile pentru tipul de tranzacție (independente de limbă) → filtrul listării (`type`).
// Leasing nu are încă filtru dedicat în /proprietati, deci trimite o căutare generală (fără `type`).
type TxType = 'buy' | 'rent' | 'lease'
const TX_TO_FILTER: Record<TxType, string | undefined> = {
  buy: 'VANZARE',
  rent: 'INCHIRIERE',
  lease: undefined,
}

export default function HeroSection() {
  const router = useRouter()
  const ref = useReveal()
  const dict = useDict()
  const [txType, setTxType] = useState<TxType>('buy')
  const [location, setLocation] = useState('')

  const txLabels: Record<TxType, string> = { buy: dict.hero.txBuy, rent: dict.hero.txRent, lease: dict.hero.txLease }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const filterType = TX_TO_FILTER[txType]
    if (filterType) params.set('type', filterType)
    if (location.trim()) params.set('q', location.trim())
    const query = params.toString()
    router.push(query ? `/proprietati?${query}` : '/proprietati')
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[var(--bg)]" ref={ref}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,113,227,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(0,113,227,0.12),_transparent_30%)] opacity-95" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-16 sm:pt-24 sm:pb-20 w-full">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="section-label mb-6 reveal">
              {dict.hero.eyebrow}
            </div>

            <h1 className="reveal reveal-delay-1 font-sans text-[clamp(42px,6vw,88px)] leading-[0.96] font-semibold tracking-[-0.04em] text-[var(--text)] max-w-none sm:max-w-[20ch] md:max-w-[16ch] lg:max-w-[12ch]">
              {dict.hero.title}
            </h1>

            <p className="reveal reveal-delay-2 mt-8 max-w-xl text-base lg:text-base text-[var(--muted)] leading-8">
              {dict.hero.subtitle}
            </p>

            <div className="reveal reveal-delay-3 mt-10 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <a href="/auth/register" className="btn-primary w-full justify-center">
                {dict.hero.ctaStart}
              </a>
              <a href="#cum-functioneaza" className="btn-outline w-full justify-center">
                {dict.hero.ctaHow}
              </a>
            </div>
          </div>

          <div className="reveal reveal-delay-3 lg:col-span-5">
            <div className="glass-panel p-8 lg:p-10 rounded-4xl border border-[var(--border)] backdrop-blur-xl">
              <div className="mb-8">
                <span className="inline-flex items-center rounded-full bg-[var(--brand-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                  {dict.hero.badge}
                </span>
              </div>

              <form onSubmit={handleSearch} className="mt-10 rounded-4xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="relative">
                  <label className="text-2xs uppercase tracking-[0.22em] text-[var(--muted)] mb-2 block">
                    {dict.hero.txTypeLabel}
                  </label>
                  <div className="relative">
                    <select
                      value={txType}
                      onChange={(e) => setTxType(e.target.value as TxType)}
                      className="appearance-none w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text)] outline-none"
                    >
                      {(['buy', 'rent', 'lease'] as TxType[]).map((t) => (
                        <option key={t} value={t}>{txLabels[t]}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  </div>
                </div>

                <div className="mt-4 relative">
                  <label htmlFor="hero-location" className="text-2xs uppercase tracking-[0.22em] text-[var(--muted)] mb-2 block">
                    {dict.hero.locationLabel}
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      id="hero-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={dict.hero.locationPlaceholder}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 pl-11 text-sm text-[var(--text)] outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-5 w-full justify-center">
                  <Search size={16} />
                  {dict.hero.search}
                </button>
              </form>

              <p className="mt-5 text-xs text-[var(--muted)] tracking-[0.16em] uppercase">
                {dict.hero.cities}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
