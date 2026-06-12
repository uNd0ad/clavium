import { NextRequest, NextResponse } from 'next/server'
import { confirmEmailToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const url = request.nextUrl.clone()
  url.search = ''

  try {
    if (!token) throw new Error('Token lipsă.')
    await confirmEmailToken(token)
    url.pathname = '/dashboard/profil'
    url.searchParams.set('email', 'verificat')
  } catch {
    url.pathname = '/dashboard/profil'
    url.searchParams.set('email', 'eroare')
  }

  return NextResponse.redirect(url)
}
