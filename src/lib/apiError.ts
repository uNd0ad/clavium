import { ZodError } from 'zod'
import { captureException } from './logger'

// Convenția codebase-ului: erorile „de business" destinate utilizatorului sunt aruncate ca
// `new Error('mesaj în română')` — constructorul Error de bază, niciodată o subclasă (nu există
// subclase proprii în src/). Orice altă instanță — PrismaClientKnownRequestError, TypeError din
// fetch, erori de SDK (Stripe/jose/S3) — e o eroare internă neașteptată: mesajul ei brut (englez,
// cu detalii tehnice) nu are voie să ajungă în toast-ul utilizatorului. O trimitem la
// captureException și afișăm mesajul generic.
export function errorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Datele trimise nu sunt valide.'
  }
  if (error instanceof Error) {
    if (error.constructor === Error) {
      return error.message
    }
    captureException(error, { op: 'errorMessage' })
    return 'A apărut o eroare.'
  }
  return 'A apărut o eroare.'
}
