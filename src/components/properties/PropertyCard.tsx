import Image from 'next/image'
import Link from 'next/link'
import { MapPin, BedDouble, Ruler, ImageIcon } from 'lucide-react'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { formatRon } from '@/lib/dashboardData'
import { formatEur, ronToEur } from '@/lib/currency'

export type PropertyCardData = {
  id: string
  title: string
  location: string
  transactionType: 'INCHIRIERE' | 'VANZARE'
  rent: number
  price: number
  rooms: number | null
  surface: number | null
  photos: string[]
}

export default function PropertyCard({ property, children, eurRate, compact }: { property: PropertyCardData; children?: React.ReactNode; eurRate?: number; compact?: boolean }) {
  const isSale = property.transactionType === 'VANZARE'
  const priceRon = isSale ? property.price : property.rent
  const badgeLabel = isSale ? 'De vânzare' : 'De închiriat'
  const href = `/proprietati/${property.id}`

  // Varianta `compact` (slider „proprietăți recente"): mai multă fotografie, badge peste imagine și
  // corp de exact 3 rânduri — titlu / detalii (ține loc de descriere) / preț cu echivalent în euro.
  if (compact) {
    const details = [property.location, property.rooms ? `${property.rooms} cam.` : null, property.surface ? `${property.surface} m²` : null]
      .filter(Boolean)
      .join(' · ')
    return (
      <div className="group flex flex-col overflow-hidden rounded-4xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)]">
        <Link href={href} className="relative block h-44 bg-[var(--brand-soft)] no-underline">
          {property.photos[0] ? (
            <Image src={property.photos[0]} alt={property.title} fill sizes="(max-width: 1280px) 100vw, 40vw" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-[var(--brand)]/40">
              <ImageIcon size={36} />
            </span>
          )}
          <span className="absolute left-3 top-3">
            <StatusBadge label={badgeLabel} variant="success" />
          </span>
        </Link>
        <div className="flex flex-col gap-1 p-4">
          <Link href={href} className="block truncate text-base font-semibold text-[var(--text)] no-underline group-hover:text-[var(--brand)]">
            {property.title}
          </Link>
          <p className="truncate text-sm text-[var(--muted)]">{details}</p>
          <p className="text-base font-semibold text-[var(--text)]">
            {formatRon(priceRon)}{' '}
            <span className="text-sm font-normal text-[var(--muted)]">
              · ~{formatEur(ronToEur(priceRon, eurRate))}{isSale ? '' : ' / lună'}
            </span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-4xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)]">
      <Link href={href} className="relative block h-44 bg-[var(--brand-soft)] no-underline">
        {property.photos[0] ? (
          <Image
            src={property.photos[0]}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[var(--brand)]/40">
            <ImageIcon size={36} />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="text-lg font-semibold text-[var(--text)] no-underline group-hover:text-[var(--brand)]">
            {property.title}
          </Link>
          <StatusBadge label={badgeLabel} variant="success" />
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
          <MapPin size={15} /> {property.location}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--muted)]">
          {property.rooms ? (
            <span className="flex items-center gap-1.5"><BedDouble size={15} /> {property.rooms} camere</span>
          ) : null}
          {property.surface ? (
            <span className="flex items-center gap-1.5"><Ruler size={15} /> {property.surface} m²</span>
          ) : null}
        </div>
        <p className="mt-4 text-xl font-semibold text-[var(--text)]">
          {isSale ? (
            <>
              {formatRon(property.price)} <span className="text-sm font-normal text-[var(--muted)]">· ~{formatEur(ronToEur(property.price, eurRate))}</span>
            </>
          ) : (
            <>
              {formatRon(property.rent)} <span className="text-sm font-normal text-[var(--muted)]">/ lună</span>
            </>
          )}
        </p>
        {children}
      </div>
    </div>
  )
}
