// Hărți pentru listări (env-gated pe NEXT_PUBLIC_MAPS_API_KEY). Pin exact doar pentru listările
// exclusive (acord de exclusivitate); pentru celelalte se arată o zonă aproximativă, ca să nu
// expunem adresa exactă. Fără cheie, componentele de hartă nu se randează (graceful degradation).
const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY

export const MAPS_ENABLED = Boolean(apiKey)

export type Coordinates = { lat: number; lng: number }

export function hasCoordinates(p: { lat: number | null; lng: number | null }): p is { lat: number; lng: number } {
  return typeof p.lat === 'number' && typeof p.lng === 'number'
}

// Rotunjește coordonatele pentru listările NEexclusive → „zonă aproximativă" (~1 km), nu adresă exactă.
const APPROX_DECIMALS = 2
export function approximate(coords: Coordinates): Coordinates {
  const round = (n: number) => Math.round(n * 10 ** APPROX_DECIMALS) / 10 ** APPROX_DECIMALS
  return { lat: round(coords.lat), lng: round(coords.lng) }
}

// Coordonatele de afișat în funcție de exclusivitate (exact vs. aproximativ).
export function displayCoordinates(p: { lat: number; lng: number; isExclusive: boolean }): Coordinates {
  return p.isExclusive ? { lat: p.lat, lng: p.lng } : approximate({ lat: p.lat, lng: p.lng })
}

// URL de hartă statică (Google Static Maps). Pin pentru exclusive, cerc de zonă pentru aproximativ.
export function staticMapUrl(p: { lat: number; lng: number; isExclusive: boolean }, opts: { width?: number; height?: number; zoom?: number } = {}): string | null {
  if (!apiKey) return null
  const { lat, lng } = displayCoordinates(p)
  const width = opts.width ?? 640
  const height = opts.height ?? 320
  const zoom = opts.zoom ?? (p.isExclusive ? 16 : 13)
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: `${width}x${height}`,
    scale: '2',
    key: apiKey,
  })
  if (p.isExclusive) params.append('markers', `color:0x0071e3|${lat},${lng}`)
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
}
