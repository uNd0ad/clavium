// Rate limiting în memorie (sliding window). Suficient pentru o singură instanță;
// la scalare orizontală se înlocuiește cu Redis/Upstash păstrând aceeași semnătură.
const buckets = new Map<string, number[]>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs)
  if (hits.length >= limit) {
    buckets.set(key, hits)
    return false
  }
  hits.push(now)
  buckets.set(key, hits)
  return true
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
}

export const RATE_LIMIT_MESSAGE = 'Prea multe încercări. Așteaptă câteva minute și încearcă din nou.'
