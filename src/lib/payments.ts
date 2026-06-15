// Procesare plăți — furnizorul real (Stripe/Netopia) se conectează aici.
// Fără PAYMENTS_API_KEY, plățile sunt procesate în mod dev (acceptate instant).
export type PaymentResult = { ok: boolean; providerRef: string; error?: string }

export async function processPayment(params: {
  amount: number
  currency?: string
  description: string
  payerEmail: string
  // Cheie stabilă per plată (referința tranzacției). O reîncercare după o eroare de rețea/DB
  // refolosește aceeași cheie, ca procesatorul să NU genereze o a doua tranzacție.
  idempotencyKey: string
}): Promise<PaymentResult> {
  const apiKey = process.env.PAYMENTS_API_KEY

  if (!apiKey) {
    console.log(`[DEV] Plată acceptată: ${params.amount} ${params.currency ?? 'RON'} — ${params.description} (${params.payerEmail})`)
    // providerRef determinist din cheie: reîncercarea returnează același ref, ca un procesator real.
    return { ok: true, providerRef: `dev_${params.idempotencyKey}` }
  }

  // TODO: integrare Stripe PaymentIntents sau Netopia — depinde de furnizorul ales.
  // Important: trimite `params.idempotencyKey` ca antet Idempotency-Key (Stripe) / orderId (Netopia).
  throw new Error('Furnizorul de plăți nu este încă integrat.')
}
