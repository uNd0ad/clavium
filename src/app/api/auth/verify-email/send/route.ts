import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getUserById } from '@/lib/userStore'
import { sendVerificationEmail } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST() {
  try {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Neautentificat.' }, { status: 401 })
    }

    if (!rateLimit(`verify-email:${sessionUser.id}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const user = await getUserById(sessionUser.id)
    if (!user) {
      return NextResponse.json({ error: 'Utilizator inexistent.' }, { status: 404 })
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Emailul este deja verificat.' }, { status: 400 })
    }

    await sendVerificationEmail(user)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
