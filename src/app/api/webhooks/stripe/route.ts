import { NextRequest, NextResponse } from 'next/server'
import { constructStripeWebhookEvent, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { settlePayment } from '@/lib/paymentSettle'
import { logger, captureException } from '@/lib/logger'

// Webhook Stripe: confirmă plățile finalizate pe pagina de checkout.
// Necesită corpul brut (raw) pentru verificarea semnăturii — de aceea citim request.text().
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe nu este configurat.' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Semnătură lipsă.' }, { status: 400 })
  }

  const payload = await request.text()

  let event
  try {
    event = constructStripeWebhookEvent(payload, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    // Semnătură invalidă: cerere care nu provine de la Stripe (sau secret greșit).
    logger.warn('stripe webhook signature invalid', { error: (err as Error).message })
    return NextResponse.json({ error: 'Semnătură invalidă.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const paymentId = session.metadata?.paymentId
    // Decontăm doar plățile efectiv achitate (mode: 'payment' → payment_status 'paid').
    if (paymentId && session.payment_status === 'paid') {
      try {
        // settlePayment e idempotent (claim atomic IN_CURS → FINALIZATA), deci o reîncercare
        // a webhook-ului e sigură. La eroare răspundem 503 ca Stripe să reîncerce, în loc să
        // marcheze evenimentul ca procesat și să lase plata nedecontată în liniște.
        await settlePayment(paymentId)
      } catch (err) {
        // Eroare neașteptată la decontare — clasă de eșec „silențios" critică: o raportăm către
        // APM (Sentry) prin captureException, nu doar în log.
        captureException(err, { op: 'stripe-webhook-settle', paymentId, eventId: event.id })
        return NextResponse.json({ error: 'Decontare eșuată.' }, { status: 503 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
