import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'
import { notify } from '@/lib/notify'
import { processPayment } from '@/lib/payments'
import { paymentReference } from '@/lib/hash'
import { formatRon } from '@/lib/dashboardData'
import { COMMISSION_PERCENT } from '@/lib/constants'

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const { id } = await params
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { property: true },
    })
    if (!contract) {
      return NextResponse.json({ error: 'Contractul nu există.' }, { status: 404 })
    }
    if (contract.tenantId !== user.id) {
      return NextResponse.json({ error: 'Doar chiriașul poate plăti chiria.' }, { status: 403 })
    }
    if (contract.status !== 'ACTIV') {
      return NextResponse.json({ error: 'Contractul nu este activ.' }, { status: 400 })
    }

    const due = await prisma.payment.findFirst({
      where: { contractId: contract.id, type: 'CHIRIE', status: 'IN_CURS' },
      orderBy: { dueDate: 'asc' },
    })
    if (!due) {
      return NextResponse.json({ error: 'Nu există nicio chirie scadentă.' }, { status: 400 })
    }

    const result = await processPayment({
      amount: due.amount,
      description: `Chirie „${contract.property.title}” (${due.reference})`,
      payerEmail: user.email,
    })
    if (!result.ok) {
      await prisma.payment.update({ where: { id: due.id }, data: { status: 'ESUATA' } })
      return NextResponse.json({ error: result.error ?? 'Plata a eșuat.' }, { status: 402 })
    }

    const commission = Math.round((due.amount * COMMISSION_PERCENT) / 100)
    const paidCount = await prisma.payment.count({
      where: { contractId: contract.id, type: 'CHIRIE', status: 'FINALIZATA' },
    })
    const nextDueDate = due.dueDate
      ? new Date(new Date(due.dueDate).setMonth(due.dueDate.getMonth() + 1))
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    const hasNextRent = paidCount + 1 < contract.months

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: due.id },
        data: { status: 'FINALIZATA', paidAt: new Date() },
      })
      // Comisionul platformei, înregistrat în contul proprietarului.
      await tx.payment.create({
        data: {
          reference: paymentReference(),
          userId: contract.ownerId,
          contractId: contract.id,
          amount: commission,
          type: 'COMISION',
          status: 'FINALIZATA',
          paidAt: new Date(),
        },
      })
      if (hasNextRent) {
        await tx.payment.create({
          data: {
            reference: paymentReference(),
            userId: contract.tenantId,
            contractId: contract.id,
            amount: contract.rent,
            type: 'CHIRIE',
            status: 'IN_CURS',
            dueDate: nextDueDate,
          },
        })
      } else {
        // Ultima chirie din contract: contractul se încheie, proprietatea redevine disponibilă.
        await tx.contract.update({ where: { id: contract.id }, data: { status: 'INCHEIAT' } })
        await tx.property.update({ where: { id: contract.propertyId }, data: { status: 'DISPONIBILA' } })
      }
    })

    await notify(
      contract.ownerId,
      'Chirie încasată',
      `${user.firstName} ${user.lastName} a plătit ${formatRon(due.amount)} pentru „${contract.property.title}”.`,
      'success'
    )

    return NextResponse.json({ success: true, reference: due.reference })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
