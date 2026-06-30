import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, BedDouble, Ruler, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StatusBadge from '@/components/dashboard/StatusBadge'
import PropertyActions from '@/components/properties/PropertyActions'
import AskOwnerForm from '@/components/properties/AskOwnerForm'
import ReportButton from '@/components/properties/ReportButton'
import PropertyGallery from '@/components/properties/PropertyGallery'
import CopyLinkButton from '@/components/ui/CopyLinkButton'
import Stars from '@/components/dashboard/Stars'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { formatRon } from '@/lib/dashboardData'
import { parsePhotos } from '@/lib/storage'
import { getUserReputation } from '@/lib/reviews'
import { formatRonWithEur } from '@/lib/currency'
import { getEurRonRate } from '@/lib/exchangeRate'
import { staticMapUrl, hasCoordinates } from '@/lib/maps'
import { getPublicListing, listingJsonLd, absoluteUrl } from '@/lib/seo'

// Datele publice ale listării sunt cache-uite între request-uri și revalidate la cel mult o oră
// (vezi `getPublicListing` → unstable_cache); personalizarea (utilizator/salvat) rămâne pe request.

// Metadate per-listare: titlu/descriere + OpenGraph/Twitter cu prima fotografie ca og:image.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const property = await getPublicListing(id)
  if (!property) return { title: 'Proprietate negăsită — Clavium.ro' }

  const isSale = property.transactionType === 'VANZARE'
  const priceLabel = isSale ? formatRon(property.price) : `${formatRon(property.rent)}/lună`
  const title = `${property.title} · ${property.location} — ${priceLabel} | Clavium.ro`
  const description = property.description?.slice(0, 160) || `${isSale ? 'De vânzare' : 'De închiriat'} în ${property.location}, direct de la proprietar pe Clavium.ro.`
  const photos = parsePhotos(property.photos).map((p) => (p.startsWith('http') ? p : absoluteUrl(p)))
  const canonical = `/proprietati/${property.id}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      ...(photos.length ? { images: [{ url: photos[0] }] } : {}),
    },
    twitter: { card: photos.length ? 'summary_large_image' : 'summary', title, description, ...(photos.length ? { images: [photos[0]] } : {}) },
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [property, user] = await Promise.all([getPublicListing(id), getCurrentUser()])

  if (!property) {
    notFound()
  }

  const saved = user
    ? Boolean(
        await prisma.savedProperty.findUnique({
          where: { userId_propertyId: { userId: user.id, propertyId: property.id } },
        })
      )
    : false

  const available = property.status === 'DISPONIBILA'
  const isSale = property.transactionType === 'VANZARE'
  const photos = parsePhotos(property.photos)
  const [ownerReputation, eurRate] = await Promise.all([getUserReputation(property.ownerId), getEurRonRate()])
  const mapUrl = hasCoordinates(property)
    ? staticMapUrl({ lat: property.lat, lng: property.lng, isExclusive: property.isExclusive })
    : null

  return (
    <>
      {/* Date structurate schema.org pentru rezultate îmbogățite în motoarele de căutare. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd(property)) }}
      />
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-6 pb-24 pt-36 lg:px-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/proprietati"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"
          >
            <ArrowLeft size={15} /> Înapoi la căutare
          </Link>
          <CopyLinkButton path={`/proprietati/${property.id}`} className="py-3 text-sm" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            <PropertyGallery photos={photos} title={property.title} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={available ? (isSale ? 'De vânzare' : 'De închiriat') : isSale ? 'Indisponibilă' : 'Închiriată'}
                  variant={available ? 'success' : 'warning'}
                />
                <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <MapPin size={15} /> {property.location}
                </p>
              </div>
              <h1 className="mt-4 text-4xl font-semibold">{property.title}</h1>
              <p className="mt-4 text-2xl font-semibold text-[var(--brand)]">
                {isSale ? (
                  formatRonWithEur(property.price, eurRate)
                ) : (
                  <>
                    {formatRon(property.rent)} <span className="text-sm font-normal text-[var(--muted)]">/ lună</span>
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {property.rooms ? (
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm">
                  <BedDouble size={16} className="text-[var(--brand)]" /> {property.rooms} camere
                </div>
              ) : null}
              {property.surface ? (
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm">
                  <Ruler size={16} className="text-[var(--brand)]" /> {property.surface} m²
                </div>
              ) : null}
              <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm">
                <ShieldCheck size={16} className="text-[var(--brand)]" /> Contract cu semnătură QES
              </div>
            </div>

            {property.description ? (
              <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="text-xl font-semibold">Descriere</h2>
                <p className="mt-4 whitespace-pre-line text-base leading-7 text-[var(--muted)]">{property.description}</p>
              </div>
            ) : null}

            {/* Hartă (doar când există coordonate ȘI o cheie Maps configurată). Pin exact pentru
                listările exclusive; zonă aproximativă altfel. */}
            {mapUrl ? (
              <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="text-xl font-semibold">Locație</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {property.isExclusive ? 'Amplasare exactă (listare exclusivă).' : 'Zonă aproximativă — adresa exactă se comunică la contact.'}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mapUrl} alt={`Hartă pentru ${property.title}, ${property.location}`} className="mt-4 w-full rounded-2xl border border-[var(--border)]" />
              </div>
            ) : null}

            <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-xl font-semibold">Proprietar</h2>
              <p className="mt-3 text-base text-[var(--muted)]">
                {property.owner.firstName} {property.owner.lastName} · membru din{' '}
                {new Intl.DateTimeFormat('ro-RO', { year: 'numeric', month: 'long' }).format(property.owner.createdAt)}
              </p>
              {ownerReputation.count > 0 ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Stars rating={ownerReputation.average} />
                  <span className="font-semibold text-[var(--text)]">{ownerReputation.average.toFixed(1)}</span>
                  ({ownerReputation.count} {ownerReputation.count === 1 ? 'recenzie' : 'recenzii'})
                </p>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <PropertyActions
              propertyId={property.id}
              initialSaved={saved}
              isAuthenticated={Boolean(user)}
              canOffer={user?.role === 'CLIENT'}
              available={available}
              transactionType={isSale ? 'VANZARE' : 'INCHIRIERE'}
            />
            <AskOwnerForm
              propertyId={property.id}
              isAuthenticated={Boolean(user)}
              isOwner={user?.id === property.ownerId}
            />
            {user && user.id !== property.ownerId ? (
              <div className="mt-4 px-1">
                <ReportButton targetType="PROPERTY" targetId={property.id} isAuthenticated />
              </div>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
