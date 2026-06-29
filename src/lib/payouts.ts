// Plăți către proprietari (Stripe Connect). Scaffold env-gated. Platforma încasează chiria + comision,
// apoi virează proprietarului partea lui. Aici e seam-ul: calculul sumei nete e pur și testabil;
// transferul efectiv (Stripe Transfer către contul conectat) se activează cu STRIPE_CONNECT_*.
//
// ATENȚIE (reglementare): manipularea fondurilor terților poate atrage reguli de instituție de plată.
// A se confirma cadrul legal înainte de a porni payout-uri reale.
import { rentCommission } from './commission'

export const PAYOUTS_ENABLED = Boolean(process.env.STRIPE_CONNECT_ENABLED === 'true')

// Suma netă (RON) care i se cuvine proprietarului dintr-o chirie încasată, după comisionul platformei.
export function ownerNetFromRent(rentAmount: number): number {
  return Math.max(0, rentAmount - rentCommission(rentAmount))
}

export type PayoutResult = { ok: boolean; transferId?: string; amount?: number; error?: string }

// Virează partea proprietarului. No-op explicit (skip) cât timp Connect nu e configurat — apelantul
// (ex. settlePayment) poate rula identic în mod dev. Cu Connect: creează un Stripe Transfer.
export async function createOwnerPayout(params: { ownerStripeAccountId?: string | null; rentAmount: number; reference: string }): Promise<PayoutResult> {
  const amount = ownerNetFromRent(params.rentAmount)
  if (!PAYOUTS_ENABLED) {
    return { ok: false, amount, error: 'Payouts dezactivate (STRIPE_CONNECT_ENABLED nesetat).' }
  }
  if (!params.ownerStripeAccountId) {
    return { ok: false, amount, error: 'Proprietarul nu are un cont Stripe conectat.' }
  }
  // TODO(extern): stripe.transfers.create({ amount: amount*100, currency: 'ron', destination: account })
  throw new Error('Stripe Connect nu este încă conectat.')
}
