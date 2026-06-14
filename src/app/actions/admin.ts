'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { adminUserUpdateSchema } from '@/lib/validations'
import { revokeAllSessions } from '@/lib/auth'

export async function updateUserAction(targetId: string, input: unknown) {
  try {
    const user = await requireActionUser(['ADMIN'])
    if (targetId === user.id) {
      return { ok: false as const, error: 'Nu îți poți modifica propriul cont de aici.' }
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } })
    if (!target) return { ok: false as const, error: 'Utilizatorul nu există.' }

    const data = adminUserUpdateSchema.parse(input)
    await prisma.user.update({
      where: { id: targetId },
      data: {
        ...(data.role ? { role: data.role } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    })

    // Schimbarea rolului sau dezactivarea invalidează sesiunile utilizatorului vizat.
    if (data.role || data.isActive === false) {
      await revokeAllSessions(targetId)
    }

    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
