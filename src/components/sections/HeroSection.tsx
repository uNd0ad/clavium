'use client'

import { useState } from 'react'
import { Search, MapPin, ChevronDown } from 'lucide-react'

const TRANSACTION_TYPES = ['Cumpărare', 'Închiriere', 'Leasing']
const PROPERTY_TYPES = ['Apartament', 'Casă', 'Teren', 'Comercial']

export default function HeroSection() {
  const [txType, setTxType] = useState('Cumpărare')
  const [propType, setPropType] = useState('Apartament')

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,113,227,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(0,113,227,0.12),_transparent_30%)] opacity-95" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-16 sm:pt-24 sm:pb-20 w-full">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="section-label mb-6">
              Prima platformă imobiliară cu design modern
            </div>

            <h1 className="font-sans text-[clamp(42px,6vw,88px)] leading-[0.96] font-semibold tracking-[-0.04em] text-[var(--text)] max-w-none sm:max-w-[20ch] md:max-w-[16ch] lg:max-w-[12ch]">
              Real estate, construită ca un produs.
            </h1>

            <p className="mt-8 max-w-xl text-[15px] lg:text-[16px] text-[var(--muted)] leading-8">
              Găsești și semnezi contractul imobiliar într-o interfață curată, rapidă și sigură. Fără comision, fără agitație, complet digital.
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
              <a href="/auth/register" className="btn-primary w-full justify-center">
                Începe gratuit
              </a>
              <a href="#cum-functioneaza" className="btn-outline w-full justify-center">
                Vezi cum funcționează
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass-panel p-8 lg:p-10 rounded-[32px] border border-white/85 backdrop-blur-xl">
              <div className="mb-8">
                <span className="inline-flex items-center rounded-full bg-[var(--brand-soft)] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                  100% digital · semnătură QES
                </span>
              </div>

              {/* <div className="space-y-7">
                {[
                  { label: 'Comision zero', value: '0 %' },
                  { label: 'Digital complet', value: '24 h' },
                  { label: 'Contract legal', value: 'QES & eIDAS' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
                    <div className="text-[14px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">
                      {item.label}
                    </div>
                    <div className="text-[28px] font-semibold text-[var(--text)]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>*/}

              <div className="mt-10 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="relative">
                    <label className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2 block">
                      Tip tranzacție
                    </label>
                    <div className="relative">
                      <select
                        value={txType}
                        onChange={(e) => setTxType(e.target.value)}
                        className="appearance-none w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] text-[var(--text)] outline-none"
                      >
                        {TRANSACTION_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2 block">
                      Tip proprietate
                    </label>
                    <div className="relative">
                      <select
                        value={propType}
                        onChange={(e) => setPropType(e.target.value)}
                        className="appearance-none w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] text-[var(--text)] outline-none"
                      >
                        {PROPERTY_TYPES.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 relative">
                  <label className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] mb-2 block">
                    Locație
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                      type="text"
                      placeholder="Oraș sau cartier..."
                      className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 pl-11 text-[14px] text-[var(--text)] outline-none"
                    />
                  </div>
                </div>

                <button className="btn-primary mt-5 w-full justify-center">
                  <Search size={16} />
                  Caută
                </button>
              </div>

              <p className="mt-5 text-[12px] text-[var(--muted)] tracking-[0.16em] uppercase">
                Timișoara · Cluj-Napoca · București · Iași · Brașov · Oradea
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
