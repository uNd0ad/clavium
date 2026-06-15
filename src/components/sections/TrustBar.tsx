const TRUST_ITEMS = [
  { value: 'Legea 214/2024', label: 'Semnătură electronică calificată', icon: '⚖' },
  { value: 'eIDAS', label: 'Standard european de autentificare', icon: '🇪🇺' },
  { value: 'GDPR', label: 'Protecție completă a datelor', icon: '🔒' },
  { value: 'SSL 256-bit', label: 'Criptare end-to-end', icon: '🛡' },
]

export default function TrustBar() {
  return (
    <div className="bg-[var(--surface-strong)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[var(--border)]">
          {TRUST_ITEMS.map((item) => (
            <div key={item.value} className="py-8 px-6 lg:px-10 flex items-start gap-4">
              <span className="mt-1 text-xl" aria-hidden>
                {item.icon}
              </span>
              <div>
                <div className="font-sans text-lg font-semibold text-[var(--text)] leading-tight">
                  {item.value}
                </div>
                <div className="text-sm text-[var(--muted)] leading-snug mt-1">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
