import { describe, expect, it } from 'vitest'
import { rateLimit } from '../rateLimit'

// Fără UPSTASH_REDIS_REST_* în env-ul de test, rateLimit folosește contorul în memorie.
describe('rateLimit', () => {
  it('permite cereri sub limită și blochează peste', async () => {
    const key = `test-${Math.random()}`
    expect(await rateLimit(key, 3, 60_000)).toBe(true)
    expect(await rateLimit(key, 3, 60_000)).toBe(true)
    expect(await rateLimit(key, 3, 60_000)).toBe(true)
    expect(await rateLimit(key, 3, 60_000)).toBe(false)
  })

  it('folosește chei independente', async () => {
    const a = `test-${Math.random()}`
    const b = `test-${Math.random()}`
    expect(await rateLimit(a, 1, 60_000)).toBe(true)
    expect(await rateLimit(a, 1, 60_000)).toBe(false)
    expect(await rateLimit(b, 1, 60_000)).toBe(true)
  })

  it('permite din nou după expirarea ferestrei', async () => {
    const key = `test-${Math.random()}`
    expect(await rateLimit(key, 1, 1)).toBe(true)
    // fereastra de 1ms a expirat până la următoarea verificare
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(await rateLimit(key, 1, 1)).toBe(true)
  })
})
