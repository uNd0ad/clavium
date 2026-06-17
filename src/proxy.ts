import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from './lib/constants'

// Construiește o Content-Security-Policy cu nonce per-request. Next.js detectează nonce-ul din
// antetul CSP și îl aplică automat pe scripturile proprii; scriptul nostru inline (tema no-flash)
// îl citește prin headers() în layout. Restul antetelor de securitate stau în next.config.js.
function buildCsp(nonce: string) {
  const isDev = process.env.NODE_ENV !== 'production'
  // În dev, Turbopack/React Fast Refresh au nevoie de 'unsafe-eval' și de un canal websocket.
  // 'strict-dynamic' invalidează allowlist-ul pe gazdă ('self'), așa că în dev ar bloca chunk-urile
  // HMR servite de pe /_next/static (ChunkLoadError). Îl aplicăm doar în producție.
  const scriptSrc = isDev
    ? `'self' 'unsafe-eval' 'nonce-${nonce}'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`
  const connectSrc = isDev ? `'self' ws:` : `'self'`
  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    // Tailwind/Sonner/next-font injectează stiluri inline — nonce pe stiluri e impracticabil.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    // Doar în producție (HTTPS). În dev pe http://localhost ar forța upgrade-ul subresurselor
    // (CSS/JS) la https, pe care serverul de dev nu-l servește — pagina ar rămâne nestilizată.
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}

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

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // Punem nonce-ul pe antetul cererii, ca să-l poată citi layout-ul (server component).
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    // Toate rutele, mai puțin fișierele statice, optimizatorul de imagini, uploads și favicon.
    {
      source: '/((?!_next/static|_next/image|favicon.ico|uploads/|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
