import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { errorMessage } from '@/lib/apiError'

// Numărul de notificări necitite ale utilizatorului curent.
export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    })
    return NextResponse.json({ count })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
