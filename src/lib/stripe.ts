import Stripe from 'stripe'

// Client Stripe partajat. Fără STRIPE_SECRET_KEY, plățile rulează în „mod dev”
// (acceptate instant, fără redirect către Stripe) — vezi src/lib/payments.ts.
const secretKey = process.env.STRIPE_SECRET_KEY

export const stripe = secretKey ? new Stripe(secretKey) : null
export const STRIPE_ENABLED = Boolean(secretKey)

// Verificarea semnăturii unui webhook este locală și nu folosește API-ul Stripe. O ținem
// independentă de clientul pentru Checkout, astfel încât endpoint-ul poate fi testat cu un
// secret de webhook fără să activăm plăți externe sau să facem cereri de rețea.
const webhookVerifier = stripe ?? new Stripe('sk_test_webhook_signature_verifier')

export function constructStripeWebhookEvent(payload: string, signature: string, secret: string) {
  return webhookVerifier.webhooks.constructEvent(payload, signature, secret)
}

// Secretul de semnătură al webhook-ului (Stripe Dashboard → Developers → Webhooks).
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
