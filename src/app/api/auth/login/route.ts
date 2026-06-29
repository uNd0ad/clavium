import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { createToken, loginUser, isNewDevice } from '@/lib/auth'
import { verifyTwoFactor } from '@/lib/twoFactor'
import { notifyNewDevice } from '@/lib/sessions'
import { COOKIE_NAME } from '@/lib/constants'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = loginSchema.parse(body)

    if (!(await rateLimit(`login:${clientIp(request)}:${data.email.toLowerCase()}`, 10, 15 * 60 * 1000))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const user = await loginUser(data)

    // Pasul 2 (2FA): parola e corectă, dar contul cere un al doilea factor. Fără cod → semnalăm
    // clientul să-l ceară (fără a emite sesiunea); cu cod → îl validăm (TOTP sau cod de rezervă).
    if (user.totpEnabled) {
      if (!data.totpCode) {
        return NextResponse.json({ twoFactorRequired: true })
      }
      if (!(await verifyTwoFactor(user, data.totpCode))) {
        return NextResponse.json({ error: 'Cod de autentificare în doi pași invalid.' }, { status: 401 })
      }
    }

    const userAgent = request.headers.get('user-agent')
    const ip = clientIp(request)
    const newDevice = await isNewDevice(user.id, userAgent)
    const token = await createToken(user, { userAgent, ip })
    if (newDevice) await notifyNewDevice(user, { userAgent, ip })

    const response = NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2,
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
