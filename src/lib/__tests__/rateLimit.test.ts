import { describe, expect, it } from 'vitest'
import { rateLimit } from '../rateLimit'

describe('rateLimit', () => {
  it('permite cereri sub limită și blochează peste', () => {
    const key = `test-${Math.random()}`
    expect(rateLimit(key, 3, 60_000)).toBe(true)
    expect(rateLimit(key, 3, 60_000)).toBe(true)
    expect(rateLimit(key, 3, 60_000)).toBe(true)
    expect(rateLimit(key, 3, 60_000)).toBe(false)
  })

  it('folosește chei independente', () => {
    const a = `test-${Math.random()}`
    const b = `test-${Math.random()}`
    expect(rateLimit(a, 1, 60_000)).toBe(true)
    expect(rateLimit(a, 1, 60_000)).toBe(false)
    expect(rateLimit(b, 1, 60_000)).toBe(true)
  })

  it('permite din nou după expirarea ferestrei', () => {
    const key = `test-${Math.random()}`
    expect(rateLimit(key, 1, 1)).toBe(true)
    // fereastra de 1ms a expirat până la următoarea verificare
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 1, 1)).toBe(true)
        resolve(undefined)
      }, 10)
    })
  })
})
