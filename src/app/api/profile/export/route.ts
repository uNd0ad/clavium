import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'

// Export GDPR: toate datele utilizatorului, descărcabile ca JSON.
export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const [account, properties, savedProperties, offersSent, offersReceived, contractsAsOwner, contractsAsTenant, payments, notifications] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true, firstName: true, lastName: true, email: true, phone: true,
            role: true, emailVerified: true, phoneVerified: true, createdAt: true,
          },
        }),
        prisma.property.findMany({ where: { ownerId: user.id } }),
        prisma.savedProperty.findMany({ where: { userId: user.id }, include: { property: { select: { title: true } } } }),
        prisma.offer.findMany({ where: { fromUserId: user.id } }),
        prisma.offer.findMany({ where: { toUserId: user.id } }),
        prisma.contract.findMany({ where: { ownerId: user.id } }),
        prisma.contract.findMany({ where: { tenantId: user.id } }),
        prisma.payment.findMany({ where: { userId: user.id } }),
        prisma.notification.findMany({ where: { userId: user.id } }),
      ])

    const data = {
      exportedAt: new Date().toISOString(),
      account,
      properties,
      savedProperties,
      offersSent,
      offersReceived,
      contractsAsOwner,
      contractsAsTenant,
      payments,
      notifications,
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="clavium-date-${user.id}.json"`,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
