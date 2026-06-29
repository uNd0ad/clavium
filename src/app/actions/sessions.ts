'use server'

import { revalidatePath } from 'next/cache'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { getCurrentSessionId } from '@/lib/session'
import { revokeUserSession, revokeOtherSessions } from '@/lib/sessions'

// Revocă o sesiune anume a utilizatorului curent („deconectează acest dispozitiv").
export async function revokeSessionAction(sessionId: string) {
  try {
    const user = await requireActionUser()
    const ok = await revokeUserSession(user.id, sessionId)
    if (!ok) return { ok: false as const, error: 'Sesiunea nu există sau e deja revocată.' }
    revalidatePath('/dashboard/profil')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Revocă toate sesiunile în afară de cea curentă („deconectează celelalte dispozitive").
export async function revokeOtherSessionsAction() {
  try {
    const user = await requireActionUser()
    const currentId = await getCurrentSessionId()
    if (!currentId) return { ok: false as const, error: 'Sesiunea curentă nu a putut fi identificată.' }
    const count = await revokeOtherSessions(user.id, currentId)
    revalidatePath('/dashboard/profil')
    return { ok: true as const, count }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
