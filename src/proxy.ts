import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_NAME } from './lib/constants'

// Construiește o Content-Security-Policy cu nonce per-request. Next.js detectează nonce-ul din
// antetul CSP și îl aplică automat pe scripturile proprii; scriptul nostru inline (tema no-flash)
// îl citește prin headers() în layout. Restul antetelor de securitate stau în next.config.js.
// CSP de producție (vezi proxy(): nu se aplică în dev). 'strict-dynamic' permite scripturilor
// noastre cu nonce să încarce restul, iar upgrade-insecure-requests forțează HTTPS.
// allowVercelLive: pe deployment-urile Vercel non-producție (Preview), bara de feedback/comentarii
// Vercel Live injectează un iframe + script de pe vercel.live și un websocket Pusher. Le permitem
// doar acolo, ca producția reală să rămână strict blocată (fără origini terțe).
function buildCsp(nonce: string, allowVercelLive: boolean) {
  const live = allowVercelLive
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${live ? ' https://vercel.live' : ''}`,
    // Tailwind/Sonner/next-font injectează stiluri inline — nonce pe stiluri e impracticabil.
    `style-src 'self' 'unsafe-inline'${live ? ' https://vercel.live' : ''}`,
    `img-src 'self' data: blob:${live ? ' https://vercel.live https://vercel.com' : ''}`,
    `font-src 'self' data:${live ? ' https://vercel.live https://assets.vercel.com' : ''}`,
    `connect-src 'self'${live ? ' https://vercel.live wss://*.pusher.com https://*.pusher.com' : ''}`,
    ...(live ? [`frame-src https://vercel.live`] : []),
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
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

  // Nonce-ul rămâne disponibil layout-ului (scriptul no-flash) în orice mediu.
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // CSP doar în producție. În dev (branch local de test, accesat și prin IP-ul din LAN de pe
  // telefon) CSP-ul cu nonce intra în conflict cu chunk-urile HMR/Turbopack încărcate dinamic →
  // ChunkLoadError și buclă de reload. Mediul de dev rulează intenționat fără securitatea de prod.
  // CSP_DISABLED=1 dezactivează CSP și pe un build de producție rulat local pe HTTP (test pe telefon
  // prin IP-ul din LAN): altfel `upgrade-insecure-requests` ar forța HTTPS pe subresurse și ar pica.
  // Dar pe un host real (Vercel) ignorăm CSP_DISABLED, ca să nu poată dezactiva CSP din greșeală
  // în producție (vezi PRODUCTION-READINESS.md, P1 #4).
  const cspDisabled = process.env.CSP_DISABLED === '1' && process.env.VERCEL !== '1'
  if (process.env.NODE_ENV === 'production' && !cspDisabled) {
    // Bara Vercel Live apare pe deployment-urile Preview; o permitem doar acolo, nu în producția reală.
    const allowVercelLive = process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production'
    const csp = buildCsp(nonce, allowVercelLive)
    requestHeaders.set('Content-Security-Policy', csp)
    response.headers.set('Content-Security-Policy', csp)
  }

  return response
}

export const config = {
  matcher: [
    // Toate rutele, mai puțin fișierele statice, uploads și tunelul Sentry. Tunelul trebuie să
    // ajungă direct la handler-ul generat de SDK, fără redirecturi sau antete injectate de proxy.
    {
      source: '/((?!monitoring|_next/static|_next/image|favicon.ico|uploads/|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
