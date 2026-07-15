'use client'

import { Children } from 'react'

// Slider vertical, o singură coloană, ~2 rânduri vizibile, cu auto-scroll continuu și lin (marquee).
// Cardurile (server components) vin ca `children` și sunt randate în DOUĂ copii identice: animația
// mută track-ul cu -50% (exact înălțimea unei copii) → buclă perfect continuă, fără salt. Fiecare
// card poartă spațierea în `pb-4` (nu `gap`), ca cele două copii să fie identice la pixel.
// Pauză la hover (ca să poți citi/da click), oprit complet la `prefers-reduced-motion`.
const FADE = 'linear-gradient(to bottom, transparent, black 7%, black 93%, transparent)'

export default function FeaturedSlider({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const items = Children.toArray(children)
  const copy = (prefix: string, hidden = false) =>
    items.map((child, i) => (
      <div key={`${prefix}-${i}`} className="pb-4" aria-hidden={hidden || undefined} inert={hidden || undefined}>
        {child}
      </div>
    ))

  return (
    <div
      className={`featured-slider overflow-hidden ${className}`}
      style={{ WebkitMaskImage: FADE, maskImage: FADE }}
    >
      <div className="featured-slider-track flex flex-col">
        {copy('a')}
        {copy('b', true)}
      </div>
    </div>
  )
}
