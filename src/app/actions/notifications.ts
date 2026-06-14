'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'

// Marchează o notificare (după id) sau toate notificările ca citite.
export async function markNotificationsReadAction(id?: string) {
  try {
    const user = await requireActionUser()
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false, ...(id ? { id } : {}) },
      data: { read: true },
    })
    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
