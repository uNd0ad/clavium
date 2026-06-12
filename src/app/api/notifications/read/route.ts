import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'

// Marchează o notificare (body: { id }) sau toate notificările ca citite.
export async function POST(request: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const body = await request.json().catch(() => ({}))
    const id = typeof body?.id === 'string' ? body.id : undefined

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false, ...(id ? { id } : {}) },
      data: { read: true },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
