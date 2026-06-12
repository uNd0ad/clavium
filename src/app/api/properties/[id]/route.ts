import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { propertyUpdateSchema } from '@/lib/validations'
import { errorMessage } from '@/lib/apiError'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(['OWNER', 'ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) {
      return NextResponse.json({ error: 'Proprietatea nu există.' }, { status: 404 })
    }
    if (user.role !== 'ADMIN' && property.ownerId !== user.id) {
      return NextResponse.json({ error: 'Nu ai permisiunea necesară.' }, { status: 403 })
    }

    const body = await request.json()
    const data = propertyUpdateSchema.parse(body)

    const updated = await prisma.property.update({ where: { id }, data })
    return NextResponse.json({ property: updated })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
