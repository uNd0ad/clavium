import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ServiceCard from '@/components/ServiceCard'
import { SERVICES, SUPPORT_EMAIL } from '@/lib/services'
import { getNavUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Servicii pentru proprietari — Vatrio.ro',
  description:
    'Lasă-ne să-ți administrăm proprietatea: evaluare, fotografie, administrare, verificare chiriași, juridic și fiscal. Agenția ta imobiliară digitală.',
}

// Pagină publică de prezentare a serviciilor de „agenție administrată" (aceeași sursă ca dashboard).
export default async function PublicServicesPage() {
  const navUser = await getNavUser()
  return (
    <>
      <Navbar initialUser={navUser} />
      <main className="mx-auto min-h-screen max-w-7xl px-6 pb-24 pt-36 lg:px-12">
        <p className="section-label">Servicii</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Lasă-ne pe noi. Ne ocupăm de tot.</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
          De la evaluare și fotografie, până la administrare completă cu chiriași, încasări și mentenanță —
          venit pasiv, fără bătăi de cap. Tu alegi cât preiei singur și cât ne lași nouă.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>

        <div className="mt-8 rounded-4xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
          <p className="font-semibold text-[var(--text)]">Ai nevoie de altceva?</p>
          <p className="mt-2 max-w-2xl">
            Spune-ne de ce serviciu ai nevoie și revenim cu o ofertă personalizată.{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[var(--brand)]">
              Scrie-ne la {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
