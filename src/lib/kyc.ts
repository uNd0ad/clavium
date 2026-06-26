// Verificarea identității (KYC).
// Cu KYC_API_KEY setat, se conectează un furnizor real (Onfido, Veriff, Sumsub) în
// `submitKycVerification`. Fără cheie (mod local, fără eIDAS), verificarea NU mai e simulată
// orbește: clientul capturează live actul de identitate și un selfie, calculează în browser
// (face-api.js) distanța dintre cele două fețe, iar serverul ia decizia aplicând un prag peste
// distanța primită. Structura rămâne pregătită să primească un furnizor real fără a schimba
// apelanții: aceeași semnătură de funcție, același rezultat.
import { sha256 } from './hash'

const apiKey = process.env.KYC_API_KEY
// Numele furnizorului configurat (informativ, salvat pe dosar). Implicit „dev".
const provider = process.env.KYC_PROVIDER || 'dev'

// KYC „real" activ doar când există o cheie de furnizor (analog STRIPE_ENABLED / QES_ENABLED).
export const KYC_ENABLED = Boolean(apiKey)

// Pragul de potrivire facială (distanță euclidiană între embedding-uri). Sub prag = aceeași
// persoană. 0.6 e pragul implicit recomandat de face-api; mai mic înseamnă mai strict.
export const KYC_MATCH_THRESHOLD = 0.6

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export type KycDecision =
  | {
      ok: true
      status: 'VERIFIED' | 'PENDING' | 'REJECTED'
      reference: string
      provider: string
      reason: string | null
      matchScore: number | null
    }
  | { ok: false; error: string }

export async function submitKycVerification(params: {
  userId: string
  fullName: string
  email: string
  // Amprentele documentelor capturate (act de identitate + selfie).
  documentHashes: string[]
  // Rezultatul potrivirii faciale calculate în browser (mod local, fără furnizor eIDAS).
  facesDetected?: boolean
  matchDistance?: number | null
}): Promise<KycDecision> {
  if (!KYC_ENABLED) {
    const reference = `kyc_dev_${sha256(params.documentHashes[0] ?? params.userId).slice(0, 8)}_${Date.now().toString(36)}`
    const distance = params.matchDistance ?? null

    // Decizia rămâne pe server: aplicăm pragul peste distanța primită de la client.
    if (!params.facesDetected || distance === null) {
      return {
        ok: true,
        status: 'REJECTED',
        reference,
        provider,
        reason: 'Nu am putut detecta o față clară pe act și/sau în selfie. Reia captura la lumină bună.',
        matchScore: distance,
      }
    }
    const matched = distance <= KYC_MATCH_THRESHOLD
    // Nu logăm date personale (nume/email) în producție; doar în dezvoltare.
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[DEV] Potrivire facială KYC pentru ${params.fullName} (${params.email}): ` +
          `distanță ${distance.toFixed(3)} (prag ${KYC_MATCH_THRESHOLD}) → ${matched ? 'VERIFIED' : 'REJECTED'}`
      )
    }
    return matched
      ? { ok: true, status: 'VERIFIED', reference, provider, reason: null, matchScore: distance }
      : {
          ok: true,
          status: 'REJECTED',
          reference,
          provider,
          reason: 'Fața din selfie nu corespunde cu cea de pe actul de identitate.',
          matchScore: distance,
        }
  }

  // TODO: integrare furnizor KYC — creează un „applicant", încarcă documentele, pornește
  // verificarea și întoarce referința dosarului. Decizia poate sosi asincron prin webhook
  // (status: 'PENDING' aici).
  throw new Error('Furnizorul KYC nu este încă integrat.')
}
