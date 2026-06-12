import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/apiAuth'
import { changePasswordSchema } from '@/lib/validations'
import { changePassword, createToken } from '@/lib/auth'
import { getUserById } from '@/lib/userStore'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'
import { COOKIE_NAME } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    if (!rateLimit(`change-password:${user.id}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await request.json()
    const data = changePasswordSchema.parse(body)
    await changePassword(user.id, data.currentPassword, data.newPassword)

    // Toate sesiunile vechi sunt revocate; emitem una nouă pentru sesiunea curentă.
    const fullUser = await getUserById(user.id)
    const token = fullUser ? await createToken(fullUser) : null

    const response = NextResponse.json({ success: true })
    if (token) {
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
      })
    }
    return response
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
