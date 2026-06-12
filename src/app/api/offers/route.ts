import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { offerSchema } from '@/lib/validations'
import { errorMessage } from '@/lib/apiError'
import { notify } from '@/lib/notify'
import { formatRon } from '@/lib/dashboardData'

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser(['CLIENT', 'ADMIN'])
  if (error) return error

  try {
    const body = await request.json()
    const data = offerSchema.parse(body)

    const property = await prisma.property.findUnique({ where: { id: data.propertyId } })
    if (!property || property.status !== 'DISPONIBILA') {
      return NextResponse.json({ error: 'Proprietatea nu este disponibilă.' }, { status: 400 })
    }
    if (property.ownerId === user.id) {
      return NextResponse.json({ error: 'Nu poți trimite o ofertă pentru propria proprietate.' }, { status: 400 })
    }

    const pending = await prisma.offer.findFirst({
      where: { propertyId: property.id, fromUserId: user.id, status: 'TRIMISA' },
    })
    if (pending) {
      return NextResponse.json({ error: 'Ai deja o ofertă în așteptare pentru această proprietate.' }, { status: 400 })
    }

    const offer = await prisma.offer.create({
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

    return NextResponse.json({ offer }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
