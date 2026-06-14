import { notFound } from 'next/navigation'
import { MapPin, BedDouble, Ruler, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import StatusBadge from '@/components/dashboard/StatusBadge'
import PropertyActions from '@/components/properties/PropertyActions'
import PropertyGallery from '@/components/properties/PropertyGallery'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { formatRon } from '@/lib/dashboardData'
import { parsePhotos } from '@/lib/storage'

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [property, user] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: { owner: { select: { firstName: true, lastName: true, createdAt: true } } },
    }),
    getCurrentUser(),
  ])

  if (!property || property.status === 'INACTIVA') {
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
  const photos = parsePhotos(property.photos)

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-7xl px-6 pb-24 pt-36 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-8">
            <PropertyGallery photos={photos} title={property.title} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge label={available ? 'Disponibilă' : 'Închiriată'} variant={available ? 'success' : 'warning'} />
                <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <MapPin size={15} /> {property.location}
                </p>
              </div>
              <h1 className="mt-4 text-4xl font-semibold">{property.title}</h1>
              <p className="mt-4 text-2xl font-semibold text-[var(--brand)]">
                {formatRon(property.rent)} <span className="text-sm font-normal text-[var(--muted)]">/ lună</span>
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
              <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="text-xl font-semibold">Descriere</h2>
                <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[var(--muted)]">{property.description}</p>
              </div>
            ) : null}

            <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-xl font-semibold">Proprietar</h2>
              <p className="mt-3 text-[15px] text-[var(--muted)]">
                {property.owner.firstName} {property.owner.lastName} · membru din{' '}
                {new Intl.DateTimeFormat('ro-RO', { year: 'numeric', month: 'long' }).format(property.owner.createdAt)}
              </p>
            </div>
          </div>

          <div className="lg:sticky lg:top-32 lg:self-start">
            <PropertyActions
              propertyId={property.id}
              initialSaved={saved}
              isAuthenticated={Boolean(user)}
              canOffer={user?.role === 'CLIENT'}
              available={available}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
