import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from './lib/constants'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (url.pathname.startsWith('/auth') && token) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth/:path*'],
}
