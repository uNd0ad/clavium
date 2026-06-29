import { NextRequest, NextResponse } from 'next/server'
import { otpVerifySchema } from '@/lib/validations'
import { createToken, verifyOtpCode, isNewDevice } from '@/lib/auth'
import { findUserByEmail } from '@/lib/userStore'
import { verifyTwoFactor } from '@/lib/twoFactor'
import { notifyNewDevice } from '@/lib/sessions'
import { COOKIE_NAME } from '@/lib/constants'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = otpVerifySchema.parse(body)

    if (!(await rateLimit(`otp-verify:${data.email.toLowerCase()}`, 5, 10 * 60 * 1000))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    // 2FA se aplică și la autentificarea prin OTP — altfel ar fi o cale de ocolire. Verificăm
    // *înainte* de a consuma OTP-ul: un prim request fără cod 2FA nu trebuie să irosească codul.
    const pending = await findUserByEmail(data.email)
    if (pending?.totpEnabled && !data.totpCode) {
      return NextResponse.json({ twoFactorRequired: true })
    }

    const user = await verifyOtpCode(data)
    if (user.totpEnabled && !(await verifyTwoFactor(user, data.totpCode ?? ''))) {
      return NextResponse.json({ error: 'Cod de autentificare în doi pași invalid.' }, { status: 401 })
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
