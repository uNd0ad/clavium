// Procesare plăți — furnizorul real (Stripe/Netopia) se conectează aici.
// Fără PAYMENTS_API_KEY, plățile sunt procesate în mod dev (acceptate instant).
export type PaymentResult = { ok: boolean; providerRef: string; error?: string }

export async function processPayment(params: {
  amount: number
  currency?: string
  description: string
  payerEmail: string
}): Promise<PaymentResult> {
  const apiKey = process.env.PAYMENTS_API_KEY

  if (!apiKey) {
    console.log(`[DEV] Plată acceptată: ${params.amount} ${params.currency ?? 'RON'} — ${params.description} (${params.payerEmail})`)
    return { ok: true, providerRef: `dev_${Date.now().toString(36)}` }
  }

  // TODO: integrare Stripe PaymentIntents sau Netopia — depinde de furnizorul ales.
  throw new Error('Furnizorul de plăți nu este încă integrat.')
}
