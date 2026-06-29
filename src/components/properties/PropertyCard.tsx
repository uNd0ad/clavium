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

export default function PropertyCard({ property, children }: { property: PropertyCardData; children?: React.ReactNode }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-4xl border border-[var(--border)] bg-[var(--surface)] transition hover:-translate-y-1 hover:shadow-[var(--shadow)]">
      <Link href={`/proprietati/${property.id}`} className="relative block h-44 bg-[var(--brand-soft)] no-underline">
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
          <Link href={`/proprietati/${property.id}`} className="text-lg font-semibold text-[var(--text)] no-underline group-hover:text-[var(--brand)]">
            {property.title}
          </Link>
          <StatusBadge label={property.transactionType === 'VANZARE' ? 'De vânzare' : 'De închiriat'} variant="success" />
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
          {property.transactionType === 'VANZARE' ? (
            <>
              {formatRon(property.price)} <span className="text-sm font-normal text-[var(--muted)]">· ~{formatEur(ronToEur(property.price))}</span>
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
