// Catalogul de servicii pentru proprietari (oferta de „agenție administrată"). Sursă unică,
// reutilizată de pagina publică /servicii, de slide-ul „Proprietari" de pe homepage și de pagina
// din dashboard. Static deocamdată: cererile se preiau prin e-mail (contact@vatrio.ro); când va
// exista un flux dedicat de comenzi, sursa de date se poate muta în DB.
import { LineChart, Camera, Sparkles, Scale, UserCheck, ShieldCheck, Building2, Calculator } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const SUPPORT_EMAIL = 'contact@vatrio.ro'

export type OwnerService = {
  icon: LucideIcon
  title: string
  description: string
  priceHint: string
  featured?: boolean
}

export const SERVICES: OwnerService[] = [
  {
    icon: LineChart,
    title: 'Evaluare proprietate',
    description: 'Raport de evaluare la prețul corect al pieței, bazat pe tranzacții comparabile din zonă.',
    priceHint: 'de la 150 RON',
    featured: true,
  },
  {
    icon: Camera,
    title: 'Fotografie profesională',
    description: 'Ședință foto și tur virtual care fac anunțul tău să iasă în evidență și să atragă mai mulți clienți.',
    priceHint: 'de la 250 RON',
  },
  {
    icon: Building2,
    title: 'Administrare proprietate',
    description: 'Preluăm relația cu chiriașii, încasările și mentenanța, ca tu să ai venit pasiv fără bătăi de cap.',
    priceHint: '8% din chirie',
    featured: true,
  },
  {
    icon: UserCheck,
    title: 'Verificare chiriași',
    description: 'Screening complet al potențialilor chiriași: istoric, bonitate și referințe înainte de semnare.',
    priceHint: 'de la 99 RON',
  },
  {
    icon: Sparkles,
    title: 'Curățenie & întreținere',
    description: 'Curățenie profesională la predare/preluare și intervenții rapide de mentenanță la cerere.',
    priceHint: 'de la 120 RON',
  },
  {
    icon: Scale,
    title: 'Asistență juridică',
    description: 'Redactarea și verificarea contractelor, înregistrare la ANAF și consultanță pe litigii locative.',
    priceHint: 'de la 200 RON',
  },
  {
    icon: ShieldCheck,
    title: 'Asigurare locuință',
    description: 'Polițe pentru locuință și conținut, cu acoperire pentru daune produse de chiriași.',
    priceHint: 'ofertă gratuită',
  },
  {
    icon: Calculator,
    title: 'Consultanță fiscală',
    description: 'Optimizarea impozitului pe venitul din chirii și depunerea declarațiilor către ANAF.',
    priceHint: 'de la 180 RON',
  },
]

// Link mailto pre-completat pentru o solicitare de serviciu (sau o solicitare generală).
export function serviceRequestMailto(title?: string): string {
  const subject = title ? `Solicitare serviciu: ${title}` : 'Solicitare serviciu'
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`
}
