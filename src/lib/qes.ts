// Semnătură electronică calificată (QES) cu certificat încărcat de semnatar.
// Semnatarul își păstrează cheia privată; semnează amprenta documentului în clientul lui,
// iar serverul verifică certificatul + semnătura (vezi `qesVerify.ts`): validitate, potrivire
// cu documentul, lanț către un QTSP calificat (config/qes-trust) și revocare (OCSP).
import { sha256 } from './hash'

// Verificarea reală + starea configurării (magazinul de ancore de încredere).
export { verifyQesSignature, qesConfigured } from './qesVerify'
export type { QesVerifyInput, QesVerifyResult } from './qesVerify'

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
// Semnatarul semnează UTF-8-ul acestui șir cu certificatul lui calificat.
export function contractDocumentHash(c: SignableContract): string {
  return sha256(contractDigest(c))
}
