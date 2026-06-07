import { NextRequest, NextResponse } from 'next/server'
import { otpVerifySchema } from '@/lib/validations'
import { createToken, verifyOtpCode } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = otpVerifySchema.parse(body)
    const user = await verifyOtpCode(data)
    const token = await createToken(user)

    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2,
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
