import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'

// Toggle: salvează / elimină proprietatea din lista utilizatorului.
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const { id } = await params
    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) {
      return NextResponse.json({ error: 'Proprietatea nu există.' }, { status: 404 })
    }

    const existing = await prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId: id } },
    })

    if (existing) {
      await prisma.savedProperty.delete({ where: { id: existing.id } })
      return NextResponse.json({ saved: false })
    }

    await prisma.savedProperty.create({ data: { userId: user.id, propertyId: id } })
    return NextResponse.json({ saved: true })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
