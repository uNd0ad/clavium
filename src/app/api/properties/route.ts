import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { propertySchema } from '@/lib/validations'
import { errorMessage } from '@/lib/apiError'

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser(['OWNER', 'ADMIN'])
  if (error) return error

  try {
    const body = await request.json()
    const data = propertySchema.parse(body)

    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        rent: data.rent,
        rooms: data.rooms,
        surface: data.surface,
        ownerId: user.id,
      },
    })

    return NextResponse.json({ property }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
