'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { offerSchema, offerActionSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'
import { formatRon } from '@/lib/dashboardData'
import { SALE_DEPOSIT_PERCENT } from '@/lib/constants'
import { addMonths } from '@/lib/contractDates'

const OPEN_CONTRACT_STATUSES = ['IN_ASTEPTARE', 'SEMNAT', 'ACTIV'] as const

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

    if (offer.property.status !== 'DISPONIBILA') {
      return { ok: false as const, error: 'Proprietatea nu este disponibilă.' }
    }

    const blockingContract = await prisma.contract.findFirst({
      where: { propertyId: offer.propertyId, status: { in: [...OPEN_CONTRACT_STATUSES] } },
    })
    if (blockingContract) {
      return { ok: false as const, error: 'Există deja un contract în curs pentru această proprietate.' }
    }

    // Acceptare: oferta devine contract în așteptarea semnăturilor; ofertele concurente se resping.
    const isSale = offer.property.transactionType === 'VANZARE'
    // La închiriere proprietatea trece direct în INCHIRIATA; la vânzare e REZERVATA până la finalizarea plăților.
    const reservedStatus = isSale ? 'REZERVATA' : 'INCHIRIATA'
    // Termeni impliciti rezonabili (editabili de owner înainte de semnare).
    // Închiriere: garanție 1 chirie, durată 12 luni de azi, scadență pe 5 ale lunii.
    // Vânzare: prețul din ofertă, avans implicit (procent din preț).
    const months = isSale ? 0 : 12
    const startDate = new Date()
    const endDate = addMonths(startDate, months)
    const saleDeposit = isSale ? Math.round((offer.amount * SALE_DEPOSIT_PERCENT) / 100) : offer.amount

    const contract = await prisma.$transaction(async (tx) => {
      // Rezervare atomică: doar o acceptare concurentă poate trece de la DISPONIBILA → rezervat.
      const reserved = await tx.property.updateMany({
        where: { id: offer.propertyId, status: 'DISPONIBILA' },
        data: { status: reservedStatus },
      })
      if (reserved.count === 0) {
        throw new Error('Proprietatea nu este disponibilă pentru acceptarea ofertei.')
      }

      const updated = await tx.offer.updateMany({
        where: { id: offerId, status: 'TRIMISA' },
        data: { status: 'ACCEPTATA' },
      })
      if (updated.count === 0) {
        throw new Error('Oferta a fost deja procesată.')
      }

      const existing = await tx.contract.findFirst({
        where: { propertyId: offer.propertyId, status: { in: [...OPEN_CONTRACT_STATUSES] } },
      })
      if (existing) {
        throw new Error('Există deja un contract în curs pentru această proprietate.')
      }

      const created = await tx.contract.create({
        data: {
          propertyId: offer.propertyId,
          ownerId: offer.toUserId,
          tenantId: offer.fromUserId,
          type: isSale ? 'VANZARE' : 'INCHIRIERE',
          rent: isSale ? 0 : offer.amount,
          price: isSale ? offer.amount : 0,
          months,
          deposit: saleDeposit,
          dueDay: 5,
          startDate,
          endDate: isSale ? null : endDate,
        },
      })

      await tx.offer.updateMany({
        where: { propertyId: offer.propertyId, status: 'TRIMISA', id: { not: offerId } },
        data: { status: 'RESPINSA' },
      })

      return created
    })

    await notify(
      offer.fromUserId,
      'Ofertă acceptată',
      isSale
        ? `Oferta ta pentru „${offer.property.title}” a fost acceptată. Antecontractul de vânzare așteaptă semnăturile.`
        : `Oferta ta pentru „${offer.property.title}” a fost acceptată. Contractul așteaptă semnăturile.`,
      'success'
    )

    revalidatePath('/dashboard', 'layout')
    return { ok: true as const, status: 'ACCEPTATA' as const, contractId: contract.id }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
