import Stripe from 'stripe'

// Client Stripe partajat. Fără STRIPE_SECRET_KEY, plățile rulează în „mod dev”
// (acceptate instant, fără redirect către Stripe) — vezi src/lib/payments.ts.
const secretKey = process.env.STRIPE_SECRET_KEY

export const stripe = secretKey ? new Stripe(secretKey) : null
export const STRIPE_ENABLED = Boolean(secretKey)

// Secretul de semnătură al webhook-ului (Stripe Dashboard → Developers → Webhooks).
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
