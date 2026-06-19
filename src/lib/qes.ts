// Semnătură electronică calificată (QES) — furnizorul eIDAS real
// (certSIGN, Namirial, DocuSign EU Qualified) se conectează în `signWithQes`.
// Fără QES_API_KEY, semnarea rulează în „mod dev" (simulată, marcată ca QES) — la fel
// ca plățile fără Stripe. Structura e pregătită să primească un furnizor real fără a
// schimba apelanții: aceeași semnătură de funcție, același rezultat.
import { sha256 } from './hash'

const apiKey = process.env.QES_API_KEY
// Numele furnizorului configurat (informativ, salvat pe semnătură). Implicit „dev".
const provider = process.env.QES_PROVIDER || 'dev'

// QES activ doar când există o cheie de furnizor (analog lui STRIPE_ENABLED).
export const QES_ENABLED = Boolean(apiKey)

export type QesResult =
  | { ok: true; qes: boolean; signatureRef: string; provider: string }
  | { ok: false; error: string }

// Câmpurile materiale ale unui contract care, împreună, definesc documentul semnat.
// Orice modificare a acestora produce o altă amprentă (deci ar invalida semnăturile).
export type SignableContract = {
  id: string
  type: string
  propertyId: string
  ownerId: string
  tenantId: string
  rent: number
  price: number
  months: number
  deposit: number
  dueDay: number
  startDate: Date | null
  endDate: Date | null
  clauses: string | null
}

// Reprezentare canonică, stabilă, a termenilor materiale — baza amprentei documentului.
// Folosim chei sortate și valori normalizate ca două procese să producă același hash.
export function contractDigest(c: SignableContract): string {
  const material = {
    id: c.id,
    type: c.type,
    propertyId: c.propertyId,
    ownerId: c.ownerId,
    tenantId: c.tenantId,
    rent: c.rent,
    price: c.price,
    months: c.months,
    deposit: c.deposit,
    dueDay: c.dueDay,
    startDate: c.startDate ? c.startDate.toISOString() : null,
    endDate: c.endDate ? c.endDate.toISOString() : null,
    clauses: c.clauses ?? null,
  }
  return JSON.stringify(material, Object.keys(material).sort())
}

// Amprenta (sha256) a documentului de contract — se leagă de fiecare semnătură.
export function contractDocumentHash(c: SignableContract): string {
  return sha256(contractDigest(c))
}

export async function signWithQes(params: {
  contractId: string
  signerEmail: string
  signerName: string
  // Amprenta documentului care se semnează (legarea de conținut, eIDAS).
  documentHash: string
}): Promise<QesResult> {
  if (!QES_ENABLED) {
    console.log(
      `[DEV] Semnătură QES simulată pentru contractul ${params.contractId} de ${params.signerName} ` +
        `(doc ${params.documentHash.slice(0, 12)}…)`
    )
    return {
      ok: true,
      qes: true,
      // În producție, această referință vine de la furnizorul QES.
      signatureRef: `qes_dev_${params.documentHash.slice(0, 8)}_${Date.now().toString(36)}`,
      provider,
    }
  }

  // TODO: integrare furnizor QES eIDAS — trimite `documentHash` + identitatea semnatarului
  // către furnizor, autentifică semnatarul cu certificatul calificat și întoarce referința.
  throw new Error('Furnizorul QES nu este încă integrat.')
}
