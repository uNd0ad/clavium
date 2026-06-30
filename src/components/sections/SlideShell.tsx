'use client'

import { useReveal } from '@/hooks/useReveal'

// Învelișul comun al unui slide: full-bleed, înălțime de un viewport, conținut centrat vertical.
// Marcat `use client` ca să poată fi folosit din slide-urile interactive. `reveal` animă conținutul
// la intrarea în ecran (respectă „mișcare redusă" prin CSS).
export default function SlideShell({
  id,
  className = '',
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  const ref = useReveal()
  return (
    <section
      id={id}
      ref={ref}
      className={`slide relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-28 lg:px-12 reveal">{children}</div>
    </section>
  )
}
