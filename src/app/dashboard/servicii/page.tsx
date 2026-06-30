import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ServiceCard from '@/components/ServiceCard'
import { getCurrentUser } from '@/lib/session'
import { SERVICES, SUPPORT_EMAIL } from '@/lib/services'

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
        {SERVICES.map((service) => (
          <ServiceCard key={service.title} service={service} />
        ))}
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
