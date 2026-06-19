// Procesare plăți prin Stripe Checkout (hosted).
// Fără STRIPE_SECRET_KEY, plățile rulează în „mod dev” (acceptate instant, fără redirect) —
// apelantul decontează direct plata cu settlePayment().
import { stripe, STRIPE_ENABLED } from './stripe'
import { settlePayment } from './paymentSettle'

export type CheckoutResult =
  // Mod dev: nu există furnizor configurat. Apelantul trebuie să deconteze plata pe loc.
  | { mode: 'dev' }
  // Producție: redirect către pagina de plată găzduită de Stripe.
  | { mode: 'redirect'; url: string }

export async function createCheckoutSession(params: {
  // Plata scadentă din baza de date (sursa de adevăr a sumei și referinței).
  payment: { id: string; reference: string; amount: number }
  description: string
  payerEmail: string
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutResult> {
  const { payment, description, payerEmail, successUrl, cancelUrl } = params

  if (!STRIPE_ENABLED || !stripe) {
    console.log(`[DEV] Plată acceptată: ${payment.amount} RON — ${description} (${payerEmail})`)
    return { mode: 'dev' }
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: payerEmail,
      client_reference_id: payment.reference,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'ron',
            // Stripe lucrează în cea mai mică unitate monetară (bani).
            unit_amount: payment.amount * 100,
            product_data: { name: description },
          },
        },
      ],
      // Decontarea se face în webhook pe baza acestui paymentId.
      metadata: { paymentId: payment.id, reference: payment.reference },
      payment_intent_data: { metadata: { paymentId: payment.id } },
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
    // Cheie stabilă per plată: o reîncercare nu creează o a doua sesiune.
    { idempotencyKey: `checkout_${payment.reference}` }
  )

  if (!session.url) throw new Error('Stripe nu a returnat un URL de plată.')
  return { mode: 'redirect', url: session.url }
}

// La întoarcerea pe success_url, verificăm direct la Stripe dacă sesiunea e achitată și
// decontăm pe loc — fără să așteptăm webhook-ul. Webhook-ul rămâne plasa de siguranță;
// `settlePayment` e idempotent, deci dubla decontare (redirect + webhook) nu strică nimic.
// Întoarce: 'paid' (decontat acum sau deja), 'unpaid' (încă neachitat), 'disabled' (fără Stripe).
export async function confirmCheckoutSession(sessionId: string): Promise<'paid' | 'unpaid' | 'disabled'> {
  if (!STRIPE_ENABLED || !stripe) return 'disabled'

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const paymentId = session.metadata?.paymentId
  if (paymentId && session.payment_status === 'paid') {
    await settlePayment(paymentId)
    return 'paid'
  }
  return 'unpaid'
}
