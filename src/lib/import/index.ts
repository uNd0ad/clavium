// Import de listări din portaluri externe (OLX / Storia / Imobiliare). Scaffold: detectează sursa
// după domeniu și extrage câmpuri de bază din HTML, pre-completând formularul de proprietate.
//
// IMPORTANT (ToS / scraping): multe portaluri interzic scraping-ul automat. Folosește acest import
// DOAR pentru propriile listări sau cu acordul sursei. Degradare elegantă: dacă nu se extrage nimic,
// întoarce câmpuri goale, fără să arunce.
export type ImportSource = 'olx' | 'storia' | 'imobiliare' | 'unknown'

export type ImportedListing = {
  source: ImportSource
  title?: string
  price?: number
  location?: string
  rooms?: number
  surface?: number
  description?: string
}

export function detectSource(url: string): ImportSource {
  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase()
    } catch {
      return ''
    }
  })()
  if (host.includes('olx.')) return 'olx'
  if (host.includes('storia.')) return 'storia'
  if (host.includes('imobiliare.')) return 'imobiliare'
  return 'unknown'
}

// Extrage primul număr (RON/EUR) dintr-un text de preț, ignorând separatorii de mii.
function parsePrice(text: string | undefined): number | undefined {
  if (!text) return undefined
  const cleaned = text.replace(/[.\s]/g, '').replace(',', '.')
  const match = cleaned.match(/\d+(?:\.\d+)?/)
  if (!match) return undefined
  const value = Math.round(Number(match[0]))
  return Number.isFinite(value) && value > 0 ? value : undefined
}

function firstMatch(html: string, patterns: RegExp[]): string | undefined {
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return m[1].trim()
  }
  return undefined
}

// Parsează HTML-ul brut al unei pagini de listare. Heuristici robuste (OpenGraph + microdate +
// fallback-uri) ca să funcționeze pe mai multe surse fără a depinde de structura exactă a fiecăreia.
export function parseListingHtml(url: string, html: string): ImportedListing {
  const source = detectSource(url)
  const title = firstMatch(html, [
    /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
    /<title>([^<]+)<\/title>/i,
  ])
  const description = firstMatch(html, [
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i,
  ])
  const priceText = firstMatch(html, [
    /<meta\s+property=["']product:price:amount["']\s+content=["']([^"']+)["']/i,
    /itemprop=["']price["'][^>]*content=["']([^"']+)["']/i,
    /"price"\s*:\s*"?([\d.,\s]+)"?/i,
  ])
  const location = firstMatch(html, [
    /<meta\s+property=["']og:locality["']\s+content=["']([^"']+)["']/i,
    /itemprop=["']addressLocality["'][^>]*>([^<]+)</i,
  ])
  const rooms = firstMatch(html, [/(\d+)\s*camere/i])
  const surface = firstMatch(html, [/(\d+)\s*m(?:p|²|2)/i])

  return {
    source,
    title,
    description,
    price: parsePrice(priceText),
    location,
    rooms: rooms ? Number(rooms) : undefined,
    surface: surface ? Number(surface) : undefined,
  }
}
