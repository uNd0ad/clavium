import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { createToken, registerUser } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/constants'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const body = await request.json()
    const data = registerSchema.parse(body)
    const user = await registerUser(data)
    const token = await createToken(user)

    const response = NextResponse.json({
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    })

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
