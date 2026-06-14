'use client'

import { useReveal } from '@/hooks/useReveal'
import { ShieldCheck, Clock, FileText, Download } from 'lucide-react'

const FEATURES = [
  { icon: ShieldCheck, label: 'QES — semnătură calificată', desc: 'Semnătură electronică cu valoare juridică echivalentă celei olografe, conform Legii 214/2024.' },
  { icon: Clock, label: 'Timestamp criptografic', desc: 'Fiecare document primește o marcă temporală garantată ce nu poate fi contestată.' },
  { icon: FileText, label: 'Arhivă securizată 10 ani', desc: 'Documentele sunt stocate criptat și accesibile oricând din dashboard.' },
  { icon: Download, label: 'PDF descărcabil imediat', desc: 'Primești contractul semnat instant pe email și în contul tău.' },
]

export default function SignatureSection() {
  const ref = useReveal()

  return (
    <section id="contracte" className="bg-[var(--bg)] py-24 lg:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-4 py-2 mb-8 text-[11px] uppercase tracking-[0.18em] text-[var(--brand)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)] animate-pulse" />
              Activ pe platformă
            </div>

            <div className="section-label reveal mb-5">Semnătură electronică</div>

            <h2 className="font-sans reveal reveal-delay-1 mb-6 text-[clamp(30px,3.5vw,48px)] leading-tight font-semibold text-[var(--text)]">
              Contracte cu valoare
              <br />
              <span className="text-[var(--brand)]">juridică deplină</span>
            </h2>

            <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-4 reveal reveal-delay-2">
              Folosim <strong className="text-[var(--text)] font-semibold">Semnătura Electronică Calificată (QES)</strong> — singura formă de semnătură digitală validă legal ca semnătura de mână.
            </p>
            <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-12 reveal reveal-delay-2">
              Contractele generate sunt pregătite pentru notar, cu dosar complet și revizie minimă. Totul în platformă pentru o experiență curată și rapidă.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 reveal reveal-delay-3">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-[18px] border border-[var(--border)] bg-[var(--card)]">
                    <Icon size={16} className="text-[var(--brand)]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--text)] mb-1">{label}</div>
                    <div className="text-[13px] text-[var(--muted)] leading-7">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal reveal-delay-2">
            <div className="surface-card rounded-[32px] border border-[var(--border)] p-8 lg:p-10">
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-[var(--border)]">
                <div>
                  <div className="text-[10px] tracking-[0.22em] uppercase text-[var(--muted)] mb-1">
                    Document nr. 2024-1847
                  </div>
                  <div className="text-[20px] font-semibold text-[var(--text)]">
                    Contract de Închiriere
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-emerald-700 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Semnat
                  </div>
                </div>
              </div>

              <div className="text-[12px] text-[var(--muted)] leading-8 mb-6 font-mono">
                <div>Între <span className="text-[var(--text)]">Ioan Popescu</span> (proprietar)</div>
                <div>și <span className="text-[var(--text)]">Maria Ionescu</span> (chiriaș)</div>
                <div className="mt-3">pentru imobilul din <span className="text-[var(--text)]">Timișoara</span></div>
                <div><span className="text-[var(--text)]">str. Circumvalațiunii nr. 12, ap. 3</span></div>
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  Durată: <span className="text-[var(--text)]">12 luni</span> · Chirie: <span className="text-[var(--text)]">450 EUR/lună</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[var(--border)] mb-6">
                {['Ioan Popescu', 'Maria Ionescu'].map((name) => (
                  <div key={name}>
                    <div className="text-[18px] font-semibold text-[var(--brand)] mb-1">{name.split(' ')[0]}</div>
                    <div className="h-px bg-[var(--border)] mb-2" />
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">{name}</div>
                    <div className="text-[10px] text-[var(--muted)]/70">QES · certiSIGN</div>
                  </div>
                ))}
              </div>

              <div className="bg-[var(--surface)] rounded-[24px] px-4 py-4 flex items-center justify-between text-[11px] text-[var(--muted)] font-mono">
                <div>SHA-256: a3f8...c91d</div>
                <div>15.03.2025 · 14:22:07 UTC</div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 btn-outline text-[11px] py-3 justify-center">
                  Descarcă PDF
                </button>
                <button className="flex-1 btn-primary text-[11px] py-3 justify-center">
                  ✦ Semnează →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
