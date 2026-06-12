import { NextRequest, NextResponse } from 'next/server'
import { revokeSessionFromToken } from '@/lib/auth'
import { COOKIE_NAME } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (token) {
    await revokeSessionFromToken(token)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  return response
}
