// Verificarea identității (KYC) — furnizorul de identitate real (Onfido, Veriff, Sumsub)
// se conectează în `submitKycVerification`. Fără KYC_API_KEY, verificarea rulează în „mod
// dev" (simulată, aprobată instant) — la fel ca plățile fără Stripe și semnarea fără furnizor
// QES. Structura e pregătită să primească un furnizor real fără a schimba apelanții: aceeași
// semnătură de funcție, același rezultat.
import { sha256 } from './hash'

const apiKey = process.env.KYC_API_KEY
// Numele furnizorului configurat (informativ, salvat pe dosar). Implicit „dev".
const provider = process.env.KYC_PROVIDER || 'dev'

// KYC activ doar când există o cheie de furnizor (analog lui STRIPE_ENABLED / QES_ENABLED).
export const KYC_ENABLED = Boolean(apiKey)

// Stările dosarului de verificare.
export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export type KycDecision =
  | { ok: true; status: 'VERIFIED' | 'PENDING'; reference: string; provider: string }
  | { ok: false; error: string }

// Amprenta (sha256) a unui document încărcat — nu stocăm documentul în clar, doar amprenta,
// ca pistă de audit a ceea ce a fost trimis spre verificare.
export function documentHash(data: Buffer): string {
  return sha256(data)
}

export async function submitKycVerification(params: {
  userId: string
  fullName: string
  email: string
  // Amprentele documentelor încărcate (act de identitate față/verso + selfie).
  documentHashes: string[]
}): Promise<KycDecision> {
  if (!KYC_ENABLED) {
    console.log(
      `[DEV] Verificare KYC simulată pentru ${params.fullName} (${params.email}) ` +
        `cu ${params.documentHashes.length} documente — aprobată instant.`
    )
    const seed = params.documentHashes[0] ?? params.userId
    return {
      ok: true,
      // În producție, decizia (și eventuala întârziere PENDING) vine de la furnizor.
      status: 'VERIFIED',
      reference: `kyc_dev_${sha256(seed).slice(0, 8)}_${Date.now().toString(36)}`,
      provider,
    }
  }

  // TODO: integrare furnizor KYC — creează un „applicant", încarcă documentele, pornește
  // verificarea și întoarce referința dosarului. Decizia finală (VERIFIED/REJECTED) poate
  // sosi asincron prin webhook, caz în care întoarcem aici status: 'PENDING'.
  throw new Error('Furnizorul KYC nu este încă integrat.')
}
