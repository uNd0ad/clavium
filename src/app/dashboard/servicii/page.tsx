import { redirect } from 'next/navigation'
import {
  LineChart,
  Camera,
  Sparkles,
  Scale,
  UserCheck,
  ShieldCheck,
  Building2,
  Calculator,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { getCurrentUser } from '@/lib/session'

// Catalog de servicii pentru proprietari. Momentan static (fără backend dedicat): butonul „Solicită”
// deschide un e-mail pre-completat către echipă (contact@clavium.ro), canalul existent prin care se
// preiau cererile. Când va exista un flux dedicat de comenzi, sursa de date se poate muta în DB.
const SUPPORT_EMAIL = 'contact@clavium.ro'
type OwnerService = {
  icon: LucideIcon
  title: string
  description: string
  priceHint: string
  featured?: boolean
}

const SERVICES: OwnerService[] = [
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

export default async function DashboardServicesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }
  // Secțiune dedicată proprietarilor; clientul nu are servicii de gestionat aici.
  if (user.role === 'CLIENT') {
    redirect('/dashboard')
  }

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Servicii"
        title="Servicii pentru"
        accent="proprietari"
        description="Tot ce ai nevoie ca să listezi, închiriezi și administrezi proprietățile mai ușor — într-un singur loc."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.title}
              className="flex flex-col rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition hover:border-[var(--brand)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon size={22} />
                </div>
                {service.featured ? (
                  <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide text-white">
                    Popular
                  </span>
                ) : null}
              </div>

              <h2 className="mt-5 text-lg font-semibold text-[var(--text)]">{service.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{service.description}</p>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                <span className="text-sm font-semibold text-[var(--text)]">{service.priceHint}</span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Solicitare serviciu: ${service.title}`)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Solicită
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-4xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--text)]">Ai nevoie de altceva?</p>
        <p className="mt-2 max-w-2xl">
          Spune-ne de ce serviciu ai nevoie și revenim cu o ofertă personalizată.{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[var(--brand)]">
            Scrie-ne la {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </div>
    </section>
  )
}
