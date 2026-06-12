import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from './lib/constants'

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone()
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (url.pathname.startsWith('/auth') && token) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  if (url.pathname.startsWith('/dashboard') && !token) {
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*'],
}
