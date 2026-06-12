import { describe, expect, it } from 'vitest'
import { sha256, randomToken, paymentReference } from '../hash'

describe('sha256', () => {
  it('produce hash determinist de 64 de caractere hex', () => {
    expect(sha256('123456')).toBe(sha256('123456'))
    expect(sha256('123456')).toMatch(/^[a-f0-9]{64}$/)
    expect(sha256('123456')).not.toBe(sha256('654321'))
  })
})

describe('randomToken', () => {
  it('generează token-uri unice suficient de lungi', () => {
    const token = randomToken()
    expect(token).toHaveLength(64)
    expect(randomToken()).not.toBe(token)
  })
})

describe('paymentReference', () => {
  it('generează referințe TRX unice', () => {
    const ref = paymentReference()
    expect(ref).toMatch(/^TRX-/)
    expect(paymentReference()).not.toBe(ref)
  })
})
