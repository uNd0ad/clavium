import { ArrowRight } from 'lucide-react'
import { serviceRequestMailto, type OwnerService } from '@/lib/services'

// Card de serviciu (prezentațional, fără hooks) — folosit în dashboard, pe pagina publică /servicii
// și în slide-ul „Proprietari" de pe homepage. „Solicită" deschide un e-mail pre-completat.
export default function ServiceCard({ service }: { service: OwnerService }) {
  const Icon = service.icon
  return (
    <div className="flex flex-col rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition hover:border-[var(--brand)]">
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

      <h3 className="mt-5 text-lg font-semibold text-[var(--text)]">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{service.description}</p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <span className="text-sm font-semibold text-[var(--text)]">{service.priceHint}</span>
        <a
          href={serviceRequestMailto(service.title)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Solicită
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  )
}
