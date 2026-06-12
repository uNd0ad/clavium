import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { offerActionSchema } from '@/lib/validations'
import { errorMessage } from '@/lib/apiError'
import { notify } from '@/lib/notify'
import { formatRon } from '@/lib/dashboardData'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(['OWNER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()
    const { action } = offerActionSchema.parse(body)

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { property: true, fromUser: true },
    })
    if (!offer) {
      return NextResponse.json({ error: 'Oferta nu există.' }, { status: 404 })
    }
    if (user.role !== 'ADMIN' && offer.toUserId !== user.id) {
      return NextResponse.json({ error: 'Nu ai permisiunea necesară.' }, { status: 403 })
    }
    if (offer.status !== 'TRIMISA') {
      return NextResponse.json({ error: 'Oferta a fost deja procesată.' }, { status: 400 })
    }

    if (action === 'reject') {
      await prisma.offer.update({ where: { id }, data: { status: 'RESPINSA' } })
      await notify(
        offer.fromUserId,
        'Ofertă respinsă',
        `Oferta ta de ${formatRon(offer.amount)} pentru „${offer.property.title}” a fost respinsă.`,
        'warning'
      )
      return NextResponse.json({ status: 'RESPINSA' })
    }

    // Acceptare: oferta devine contract în așteptarea semnăturilor,
    // iar celelalte oferte în curs pentru aceeași proprietate se resping.
    const [, contract] = await prisma.$transaction([
      prisma.offer.update({ where: { id }, data: { status: 'ACCEPTATA' } }),
      prisma.contract.create({
        data: {
          propertyId: offer.propertyId,
          ownerId: offer.toUserId,
          tenantId: offer.fromUserId,
          rent: offer.amount,
        },
      }),
      prisma.offer.updateMany({
        where: { propertyId: offer.propertyId, status: 'TRIMISA', id: { not: id } },
        data: { status: 'RESPINSA' },
      }),
    ])

    await notify(
      offer.fromUserId,
      'Ofertă acceptată',
      `Oferta ta pentru „${offer.property.title}” a fost acceptată. Contractul așteaptă semnăturile.`,
      'success'
    )

    return NextResponse.json({ status: 'ACCEPTATA', contractId: contract.id })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
