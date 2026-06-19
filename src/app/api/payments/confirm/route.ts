import { NextRequest, NextResponse } from 'next/server'
import { confirmCheckoutSession } from '@/lib/payments'
import { captureException } from '@/lib/logger'

// Punctul de întoarcere de pe Stripe Checkout (success_url). Verifică sesiunea la Stripe și
// decontează plata pe loc, fără să depindă de momentul în care ajunge webhook-ul. Apoi
// redirecționează utilizatorul către lista de contracte cu un indicator de stare.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')
  // Rămânem pe gazda pe care a folosit-o utilizatorul (localhost, IP din LAN sau domeniul de prod),
  // ca întoarcerea finală după plată să nu sară pe localhost.
  const target = new URL('/dashboard/contracte', request.nextUrl.origin)

  if (!sessionId) {
    target.searchParams.set('plata', 'anulat')
    return NextResponse.redirect(target)
  }

  try {
    const result = await confirmCheckoutSession(sessionId)
    // 'unpaid' (rar): plata nu e încă marcată achitată la Stripe — webhook-ul o va prelua.
    target.searchParams.set('plata', result === 'paid' ? 'succes' : 'in_asteptare')
  } catch (err) {
    captureException(err, { scope: 'payments.confirm', sessionId })
    target.searchParams.set('plata', 'eroare')
  }

  return NextResponse.redirect(target)
}
