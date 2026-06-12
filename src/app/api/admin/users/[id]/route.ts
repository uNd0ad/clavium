import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { adminUserUpdateSchema } from '@/lib/validations'
import { errorMessage } from '@/lib/apiError'
import { revokeAllSessions } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireUser(['ADMIN'])
  if (error) return error

  try {
    const { id } = await params
    if (id === user.id) {
      return NextResponse.json({ error: 'Nu îți poți modifica propriul cont de aici.' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: 'Utilizatorul nu există.' }, { status: 404 })
    }

    const body = await request.json()
    const data = adminUserUpdateSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.role ? { role: data.role } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    })

    // Schimbarea rolului sau dezactivarea invalidează sesiunile existente.
    if (data.role || data.isActive === false) {
      await revokeAllSessions(id)
    }

    return NextResponse.json({
      user: { id: updated.id, role: updated.role, isActive: updated.isActive },
    })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
