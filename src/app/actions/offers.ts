'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { offerSchema, offerActionSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'
import { formatRon } from '@/lib/dashboardData'

export async function createOfferAction(input: unknown) {
  try {
    const user = await requireActionUser(['CLIENT', 'ADMIN'])
    const data = offerSchema.parse(input)

    const property = await prisma.property.findUnique({ where: { id: data.propertyId } })
    if (!property || property.status !== 'DISPONIBILA') {
      return { ok: false as const, error: 'Proprietatea nu este disponibilă.' }
    }
    if (property.ownerId === user.id) {
      return { ok: false as const, error: 'Nu poți trimite o ofertă pentru propria proprietate.' }
    }

    const pending = await prisma.offer.findFirst({
      where: { propertyId: property.id, fromUserId: user.id, status: 'TRIMISA' },
    })
    if (pending) {
      return { ok: false as const, error: 'Ai deja o ofertă în așteptare pentru această proprietate.' }
    }

    await prisma.offer.create({
      data: {
        propertyId: property.id,
        fromUserId: user.id,
        toUserId: property.ownerId,
        amount: data.amount,
      },
    })
    await notify(
      property.ownerId,
      'Ofertă nouă primită',
      `${user.firstName} ${user.lastName} a oferit ${formatRon(data.amount)} pentru „${property.title}”.`,
      'info'
    )

    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function respondToOfferAction(offerId: string, action: 'accept' | 'reject') {
  try {
    const user = await requireActionUser(['OWNER', 'ADMIN'])
    offerActionSchema.parse({ action })

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { property: true, fromUser: true },
    })
    if (!offer) return { ok: false as const, error: 'Oferta nu există.' }
    if (user.role !== 'ADMIN' && offer.toUserId !== user.id) {
      return { ok: false as const, error: 'Nu ai permisiunea necesară.' }
    }
    if (offer.status !== 'TRIMISA') {
      return { ok: false as const, error: 'Oferta a fost deja procesată.' }
    }

    if (action === 'reject') {
      await prisma.offer.update({ where: { id: offerId }, data: { status: 'RESPINSA' } })
      await notify(
        offer.fromUserId,
        'Ofertă respinsă',
        `Oferta ta de ${formatRon(offer.amount)} pentru „${offer.property.title}” a fost respinsă.`,
        'warning'
      )
      revalidatePath('/dashboard', 'layout')
      return { ok: true as const, status: 'RESPINSA' as const }
    }

    // Acceptare: oferta devine contract în așteptarea semnăturilor; ofertele concurente se resping.
    // Termeni impliciti rezonabili (editabili de owner înainte de semnare): garanție 1 chirie,
    // durată 12 luni de azi, scadență pe 5 ale lunii.
    const months = 12
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + months)
    const [, contract] = await prisma.$transaction([
      prisma.offer.update({ where: { id: offerId }, data: { status: 'ACCEPTATA' } }),
      prisma.contract.create({
        data: {
          propertyId: offer.propertyId,
          ownerId: offer.toUserId,
          tenantId: offer.fromUserId,
          rent: offer.amount,
          months,
          deposit: offer.amount,
          dueDay: 5,
          startDate,
          endDate,
        },
      }),
      prisma.offer.updateMany({
        where: { propertyId: offer.propertyId, status: 'TRIMISA', id: { not: offerId } },
        data: { status: 'RESPINSA' },
      }),
    ])

    await notify(
      offer.fromUserId,
      'Ofertă acceptată',
      `Oferta ta pentru „${offer.property.title}” a fost acceptată. Contractul așteaptă semnăturile.`,
      'success'
    )

    revalidatePath('/dashboard', 'layout')
    return { ok: true as const, status: 'ACCEPTATA' as const, contractId: contract.id }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
