import { describe, it, expect } from 'vitest'
import { generateTotpSecret, generateTotp, verifyTotp, totpAuthUri } from '@/lib/totp'

const STEP_MS = 30_000

describe('TOTP (RFC 6238)', () => {
  it('generează un secret base32 și verifică propriul cod curent', () => {
    const secret = generateTotpSecret()
    expect(secret).toMatch(/^[A-Z2-7]+$/)
    const now = Date.now()
    const code = generateTotp(secret, now)
    expect(code).toMatch(/^\d{6}$/)
    expect(verifyTotp(secret, code, { now })).toBe(true)
  })

  it('acceptă codul din pasul anterior/următor (fereastră ±1) dar nu mai departe', () => {
    const secret = generateTotpSecret()
    const now = Date.now()
    const code = generateTotp(secret, now)
    expect(verifyTotp(secret, code, { now: now + STEP_MS })).toBe(true) // pasul următor
    expect(verifyTotp(secret, code, { now: now - STEP_MS })).toBe(true) // pasul anterior
    expect(verifyTotp(secret, code, { now: now + 3 * STEP_MS })).toBe(false) // prea departe
  })

  it('respinge coduri greșite și intrări care nu sunt 6 cifre', () => {
    const secret = generateTotpSecret()
    const now = Date.now()
    const real = generateTotp(secret, now)
    const wrong = real === '000000' ? '111111' : '000000'
    expect(verifyTotp(secret, wrong, { now })).toBe(false)
    expect(verifyTotp(secret, 'abc', { now })).toBe(false)
    expect(verifyTotp(secret, '12345', { now })).toBe(false)
    expect(verifyTotp(secret, '', { now })).toBe(false)
  })

  it('coduri diferite pentru secrete diferite', () => {
    const now = Date.now()
    expect(generateTotp(generateTotpSecret(), now)).not.toBe(generateTotp(generateTotpSecret(), now + 9 * STEP_MS))
  })

  it('produce un URI otpauth valid pentru QR', () => {
    const uri = totpAuthUri('JBSWY3DPEHPK3PXP', 'user@ex.ro')
    expect(uri).toContain('otpauth://totp/')
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP')
    expect(uri).toContain('issuer=Clavium')
  })
})
