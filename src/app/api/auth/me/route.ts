import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/constants'

export async function GET(request: Request) {
  const token = request.headers.get('cookie')
    ?.split(';')
    .map((item) => item.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`))
    ?.split('=')[1]

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const user = await getUserFromToken(token)
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } })
}
