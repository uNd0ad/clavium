'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown, ArrowRight } from 'lucide-react'
import SlideShell from './SlideShell'
import FeaturedSlider from './FeaturedSlider'
import { useDict } from '@/lib/i18n/client'

// Slide 1 — solicitanți de chirie & cumpărători (vârful pâlniei). Beneficiu + căutare + dovadă
// (listări reale). Valorile tipului de tranzacție sunt stabile (independente de limbă) → filtrul listării.
type TxType = 'buy' | 'rent' | 'lease'
const TX_TO_FILTER: Record<TxType, string | undefined> = { buy: 'VANZARE', rent: 'INCHIRIERE', lease: undefined }

export default function SlideRenters({ featured, featuredCount }: { featured: React.ReactNode; featuredCount: number }) {
  const router = useRouter()
  const dict = useDict()
  const t = dict.home.renters
  const [txType, setTxType] = useState<TxType>('rent')
  const [location, setLocation] = useState('')
  const txLabels: Record<TxType, string> = { buy: dict.hero.txBuy, rent: dict.hero.txRent, lease: dict.hero.txLease }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    const filterType = TX_TO_FILTER[txType]
    if (filterType) params.set('type', filterType)
    if (location.trim()) params.set('q', location.trim())
    const q = params.toString()
    router.push(q ? `/proprietati?${q}` : '/proprietati')
  }

  return (
    <SlideShell
      id="caut"
      className="bg-[var(--bg)]"
      background={
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,113,227,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,113,227,0.1),_transparent_32%)]" />
      }
    >
      <div className="relative grid items-stretch gap-10 xl:grid-cols-[1.05fr_0.95fr] xl:gap-14">
        {/* Stânga: mesaj + căutare */}
        <div>
          <div className="section-label mb-5">{t.eyebrow}</div>
          <h1 className="font-sans text-[clamp(40px,5vw,68px)] font-semibold leading-[1.0] tracking-[-0.04em] text-[var(--text)]">
            {t.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">{t.subtitle}</p>

          <form onSubmit={handleSearch} className="mt-8 grid gap-3 rounded-4xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] sm:grid-cols-[170px_minmax(0,1fr)_auto]">
            <div className="relative">
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as TxType)}
                aria-label={dict.hero.txTypeLabel}
                className="w-full appearance-none rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--text)] outline-none"
              >
                {(['rent', 'buy', 'lease'] as TxType[]).map((tx) => (
                  <option key={tx} value={tx}>{txLabels[tx]}</option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            </div>
            <div className="relative">
              <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={dict.hero.locationPlaceholder}
                aria-label={dict.hero.locationLabel}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 pl-11 text-sm text-[var(--text)] outline-none"
              />
            </div>
            <button type="submit" className="btn-primary justify-center px-6">
              <Search size={16} />
              {dict.hero.search}
            </button>
          </form>
        </div>

        {/* Dreapta: listări reale, simetrice cu blocul hero (aceeași înălțime) */}
        {featuredCount > 0 ? (
          <div className="flex min-h-0 flex-col">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{t.featuredTitle}</h2>
              <Link href="/proprietati" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)]">
                {t.browse} <ArrowRight size={15} />
              </Link>
            </div>
            {/* Slider (o coloană, auto-scroll lin) care umple restul coloanei → aceeași înălțime ca
                hero-ul la xl (simetrie). Înălțime fixă sub xl, unde layout-ul e stivuit. */}
            <div className="relative min-h-0 h-[26rem] xl:h-auto xl:flex-1">
              <FeaturedSlider className="absolute inset-0">{featured}</FeaturedSlider>
            </div>
          </div>
        ) : null}
      </div>
    </SlideShell>
  )
}
