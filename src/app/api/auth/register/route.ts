import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { createToken, registerUser } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/constants'
import { errorMessage } from '@/lib/apiError'

export async function POST(request: NextRequest) {
  try {
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
