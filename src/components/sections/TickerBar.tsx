const items = [
  'Vânzare-Cumpărare',
  'Închiriere',
  'Leasing Imobiliar',
  'Semnătură Electronică Calificată',
  'QES · Legea 214/2024',
  'Contract Generat Automat',
  'Fără Intermediari',
  'eIDAS Compliant',
  'Antecontract Digital',
]

export default function TickerBar() {
  return (
    <div className="bg-[var(--surface-strong)] overflow-hidden border-y border-[var(--border)] select-none">
      <div className="flex py-4" aria-hidden>
        <div className="flex animate-ticker whitespace-nowrap shrink-0 gap-0">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-6 px-8 text-[11px] tracking-[0.18em] uppercase text-[var(--muted)]"
            >
              {item}
              <span className="w-1 h-1 rounded-full bg-[var(--brand)]/60 shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
