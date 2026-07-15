'use server'

import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { parseListingHtml, type ImportedListing } from '@/lib/import'
import { logger } from '@/lib/logger'

// Activează importul de listări (gated, din cauza ToS-ului portalurilor). Fără el → dezactivat.
const IMPORT_ENABLED = process.env.LISTING_IMPORT_ENABLED === 'true'

// Importă o listare dintr-un URL extern (OLX/Storia/Imobiliare) și întoarce câmpurile pre-completate.
// Doar OWNER/ADMIN. Best-effort: la orice eșec, întoarce o eroare prietenoasă (formularul rămâne gol).
export async function importListingAction(url: string): Promise<{ ok: true; listing: ImportedListing } | { ok: false; error: string }> {
  try {
    await requireActionUser(['OWNER', 'ADMIN'])
    if (!IMPORT_ENABLED) {
      return { ok: false, error: 'Importul de listări nu este activat pe această instanță.' }
    }
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return { ok: false, error: 'URL invalid.' }
    }
    if (parsed.protocol !== 'https:') return { ok: false, error: 'Doar adrese https sunt acceptate.' }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    let html: string
    try {
      const res = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: { 'User-Agent': 'VatrioBot/1.0 (+https://vatrio.ro)' },
      })
      if (!res.ok) return { ok: false, error: `Sursa a răspuns cu ${res.status}.` }
      html = await res.text()
    } finally {
      clearTimeout(timeout)
    }

    const listing = parseListingHtml(parsed.toString(), html)
    return { ok: true, listing }
  } catch (err) {
    logger.warn('import: eșuat', { error: errorMessage(err) })
    return { ok: false, error: 'Nu am putut importa listarea. Completează manual.' }
  }
}
