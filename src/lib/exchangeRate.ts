// Cursul EUR→RON din sursa oficială: feed-ul de referință BNR (Banca Națională a României).
// BNR publică o dată pe zi lucrătoare (~13:00 ora României). Cache-uim la nivel de date (Next),
// revalidat la 6h, ca să nu lovim BNR la fiecare render. `EUR_RON_RATE` rămâne un override manual
// (dacă e setat, are prioritate); fără el și fără BNR disponibil, cădem pe un curs implicit.
import { unstable_cache } from 'next/cache'
import { logger } from './logger'

const BNR_URL = 'https://www.bnr.ro/nbrfxrates.xml'
const DEFAULT_RATE = 4.97

// Extrage cursul EUR din XML-ul BNR. EUR nu are `multiplier` (e 1), dar îl tratăm generic pentru
// robustețe. Funcție pură → testabilă fără rețea.
export function parseBnrEurRon(xml: string): number {
  const match = xml.match(/<Rate\b[^>]*\bcurrency="EUR"[^>]*>([\d.]+)<\/Rate>/i)
  if (!match) throw new Error('Cursul EUR nu a fost găsit în feed-ul BNR.')
  const value = Number(match[1])
  const multiplierMatch = match[0].match(/\bmultiplier="(\d+)"/i)
  const multiplier = multiplierMatch ? Number(multiplierMatch[1]) : 1
  const rate = value / (multiplier || 1)
  if (!Number.isFinite(rate) || rate <= 0) throw new Error('Curs EUR invalid în feed-ul BNR.')
  return rate
}

async function fetchBnrEurRon(): Promise<number> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(BNR_URL, { signal: controller.signal, headers: { Accept: 'application/xml' } })
    if (!res.ok) throw new Error(`BNR a răspuns cu ${res.status}.`)
    return parseBnrEurRon(await res.text())
  } finally {
    clearTimeout(timeout)
  }
}

// Cursul curent EUR→RON: override manual (EUR_RON_RATE) > BNR (cache-uit ~6h) > implicit. Cache-ul
// se creează în interiorul funcției (nu la nivel de modul), ca importul să fie sigur și în afara
// unui context Next (ex. teste). Un eșec NU se cachează (aruncă) → reîncercăm la următorul apel.
export async function getEurRonRate(): Promise<number> {
  const override = Number(process.env.EUR_RON_RATE)
  if (Number.isFinite(override) && override > 0) return override
  try {
    return await unstable_cache(fetchBnrEurRon, ['bnr-eur-ron'], { revalidate: 21_600 })()
  } catch (err) {
    logger.warn('curs BNR indisponibil — folosesc cursul implicit', { error: (err as Error).message })
    return DEFAULT_RATE
  }
}
