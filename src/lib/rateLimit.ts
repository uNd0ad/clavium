// Rate limiting cu fereastră glisantă.
// - Implicit (un singur proces / dev): contor în memorie. Suficient local, dar pe serverless
//   (Vercel) fiecare instanță are propriul contor și se resetează la cold start → protecție
//   slabă împotriva brute-force / flood OTP.
// - Când UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN sunt setate, folosim Redis (Upstash)
//   ca stare partajată între instanțe (vezi PRODUCTION-READINESS.md, P0 #2).
// Aceeași semnătură pentru apelanți: `await rateLimit(key, limit, windowMs)` → true = permis.
import { logger } from './logger'

const buckets = new Map<string, number[]>()

function rateLimitMemory(key: string, limit: number, windowMs: number): boolean {
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

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const redisEnabled = Boolean(REDIS_URL && REDIS_TOKEN)

// Fereastră glisantă pe un sorted set Redis, printr-un pipeline atomic peste REST-ul Upstash:
// scoatem intrările expirate, adăugăm hitul curent, numărăm câte sunt în fereastră, setăm TTL.
async function rateLimitRedis(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  const member = `${now}-${Math.random().toString(36).slice(2)}`
  const redisKey = `rl:${key}`
  const commands = [
    ['ZREMRANGEBYSCORE', redisKey, '0', String(now - windowMs)],
    ['ZADD', redisKey, String(now), member],
    ['ZCARD', redisKey],
    ['PEXPIRE', redisKey, String(windowMs)],
  ]
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`)
  const data = (await res.json()) as Array<{ result?: number; error?: string }>
  const count = data[2]?.result
  if (typeof count !== 'number') throw new Error('Răspuns Upstash invalid')
  return count <= limit
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!redisEnabled) return rateLimitMemory(key, limit, windowMs)
  try {
    return await rateLimitRedis(key, limit, windowMs)
  } catch (err) {
    // La o pană Redis nu blocăm utilizatorii legitimi (fail-open), dar logăm și cădem pe memorie.
    logger.error('rateLimit: Redis indisponibil, fallback în memorie', { error: (err as Error).message })
    return rateLimitMemory(key, limit, windowMs)
  }
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
}

export const RATE_LIMIT_MESSAGE = 'Prea multe încercări. Așteaptă câteva minute și încearcă din nou.'
