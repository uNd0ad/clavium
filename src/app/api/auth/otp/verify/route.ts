import { NextRequest, NextResponse } from 'next/server'
import { otpVerifySchema } from '@/lib/validations'
import { createToken, verifyOtpCode } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/constants'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = otpVerifySchema.parse(body)

    if (!rateLimit(`otp-verify:${data.email.toLowerCase()}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const user = await verifyOtpCode(data)
    const token = await createToken(user)

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
