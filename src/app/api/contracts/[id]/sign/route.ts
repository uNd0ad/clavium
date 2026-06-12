import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'
import { notify } from '@/lib/notify'
import { signWithQes } from '@/lib/qes'
import { paymentReference } from '@/lib/hash'

const RENT_DUE_DAYS = 5

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const { id } = await params
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { property: true, owner: true, tenant: true },
    })
    if (!contract) {
      return NextResponse.json({ error: 'Contractul nu există.' }, { status: 404 })
    }

    const isOwner = contract.ownerId === user.id
    const isTenant = contract.tenantId === user.id
    if (!isOwner && !isTenant) {
      return NextResponse.json({ error: 'Nu ești parte în acest contract.' }, { status: 403 })
    }
    if (contract.status !== 'IN_ASTEPTARE' && contract.status !== 'SEMNAT') {
      return NextResponse.json({ error: 'Contractul nu mai poate fi semnat.' }, { status: 400 })
    }
    if ((isOwner && contract.signedByOwner) || (isTenant && contract.signedByClient)) {
      return NextResponse.json({ error: 'Ai semnat deja acest contract.' }, { status: 400 })
    }

    const qes = await signWithQes({
      contractId: contract.id,
      signerEmail: user.email,
      signerName: `${user.firstName} ${user.lastName}`,
    })
    if (!qes.ok) {
      return NextResponse.json({ error: 'Semnarea QES a eșuat.' }, { status: 502 })
    }

    const signedByOwner = contract.signedByOwner || isOwner
    const signedByClient = contract.signedByClient || isTenant
    const bothSigned = signedByOwner && signedByClient

    const updated = await prisma.contract.update({
      where: { id },
      data: {
        signedByOwner,
        signedByClient,
        qes: true,
        status: bothSigned ? 'ACTIV' : 'SEMNAT',
        startDate: bothSigned ? new Date() : contract.startDate,
      },
    })

    if (bothSigned) {
      // Contract activ: proprietatea devine închiriată și prima chirie devine scadentă.
      await prisma.property.update({
        where: { id: contract.propertyId },
        data: { status: 'INCHIRIATA' },
      })
      await prisma.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.tenantId,
          contractId: contract.id,
          amount: contract.rent,
          type: 'CHIRIE',
          status: 'IN_CURS',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * RENT_DUE_DAYS),
        },
      })
      const message = `Contractul pentru „${contract.property.title}” este activ. Prima chirie este scadentă în ${RENT_DUE_DAYS} zile.`
      await notify(contract.tenantId, 'Contract activ', message, 'success')
      await notify(contract.ownerId, 'Contract activ', message, 'success')
    } else {
      const otherParty = isOwner ? contract.tenantId : contract.ownerId
      await notify(
        otherParty,
        'Semnătură necesară',
        `${user.firstName} ${user.lastName} a semnat contractul pentru „${contract.property.title}”. Mai lipsește semnătura ta.`,
        'warning'
      )
    }

    return NextResponse.json({ contract: updated })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
