'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { profileUpdateSchema, changePasswordSchema } from '@/lib/validations'
import { changePassword, createToken, revokeAllSessions } from '@/lib/auth'
import { getUserById, normalizePhone } from '@/lib/userStore'
import { rateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { COOKIE_NAME } from '@/lib/constants'

export async function updateProfileAction(input: unknown) {
  try {
    const user = await requireActionUser()
    const data = profileUpdateSchema.parse(input)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.firstName ? { firstName: data.firstName } : {}),
        ...(data.lastName ? { lastName: data.lastName } : {}),
        // Numărul nou trebuie re-verificat prin OTP înainte de a fi de încredere.
        ...(data.phone ? { phone: normalizePhone(data.phone), phoneVerified: false } : {}),
      },
    })
    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function changePasswordAction(input: unknown) {
  try {
    const user = await requireActionUser()
    if (!(await rateLimit(`change-password:${user.id}`, 5, 15 * 60 * 1000))) {
      return { ok: false as const, error: RATE_LIMIT_MESSAGE }
    }
    const data = changePasswordSchema.parse(input)
    await changePassword(user.id, data.currentPassword, data.newPassword)

    // Toate sesiunile vechi sunt revocate; emitem una nouă pentru sesiunea curentă.
    const fullUser = await getUserById(user.id)
    if (fullUser) {
      const token = await createToken(fullUser)
      const store = await cookies()
      store.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
      })
    }
    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Dezactivarea contului (soft delete): contul nu mai poate fi folosit, datele rămân pentru contracte.
export async function deactivateAccountAction() {
  try {
    const user = await requireActionUser()
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } })
    await revokeAllSessions(user.id)
    const store = await cookies()
    store.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
