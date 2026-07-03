'use client'

import { useReveal } from '@/hooks/useReveal'

// Învelișul comun al unui slide: full-bleed, înălțime de un viewport, conținut centrat vertical.
// Marcat `use client` ca să poată fi folosit din slide-urile interactive. `reveal` animă conținutul
// la intrarea în ecran (respectă „mișcare redusă" prin CSS).
//
// `background`: strat decorativ (ex. gradient) randat DIRECT în <section>, în afara containerului
// `.reveal`. Important: `.reveal.visible` are `transform`, deci devine bloc de referință pentru
// pozitionarea absolută — un fundal `absolute inset-0` pus în interiorul lui ar fi „încutiat" la
// max-w-[1600px] în loc să se întindă pe tot ecranul. Pus la nivel de <section>, se întinde full-bleed.
export default function SlideShell({
  id,
  className = '',
  background,
  children,
}: {
  id?: string
  className?: string
  background?: React.ReactNode
  children: React.ReactNode
}) {
  const ref = useReveal()
  return (
    <section
      id={id}
      ref={ref}
      className={`slide relative flex min-h-[100svh] w-full flex-col justify-center overflow-hidden ${className}`}
    >
      {background}
      <div className="mx-auto w-full max-w-[1600px] px-6 pb-24 pt-32 lg:px-16 reveal">{children}</div>
    </section>
  )
}
