import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema, phoneSchema, offerSchema, propertySchema } from '../validations'

describe('phoneSchema', () => {
  it('acceptă numere românești cu spații și prefix', () => {
    expect(phoneSchema.parse('0727 191 815')).toBe('0727191815')
    expect(phoneSchema.parse('+40727191815')).toBe('+40727191815')
  })

  it('respinge numere invalide', () => {
    expect(() => phoneSchema.parse('12345')).toThrow()
    expect(() => phoneSchema.parse('0123456789')).toThrow()
  })
})

describe('registerSchema', () => {
  const valid = {
    firstName: 'Ion',
    lastName: 'Popescu',
    email: 'ion@example.com',
    password: 'parola123',
    phone: '0727191815',
  }

  it('acceptă date valide și pune CLIENT ca rol implicit', () => {
    expect(registerSchema.parse(valid).role).toBe('CLIENT')
  })

  it('acceptă rolul OWNER dar respinge ADMIN la înregistrare publică', () => {
    expect(registerSchema.parse({ ...valid, role: 'OWNER' }).role).toBe('OWNER')
    expect(() => registerSchema.parse({ ...valid, role: 'ADMIN' })).toThrow()
  })

  it('cere telefon și parolă de minim 8 caractere', () => {
    expect(() => registerSchema.parse({ ...valid, phone: undefined })).toThrow()
    expect(() => registerSchema.parse({ ...valid, password: 'scurt' })).toThrow()
  })
})

describe('loginSchema', () => {
  it('respinge emailuri invalide', () => {
    expect(() => loginSchema.parse({ email: 'invalid', password: 'parola123' })).toThrow()
  })
})

describe('offerSchema', () => {
  it('respinge sume negative sau zero', () => {
    const propertyId = '4f57b9a2-8a8e-4f7a-9c1d-2e3f4a5b6c7d'
    expect(() => offerSchema.parse({ propertyId, amount: 0 })).toThrow()
    expect(() => offerSchema.parse({ propertyId, amount: -100 })).toThrow()
    expect(offerSchema.parse({ propertyId, amount: '1800' }).amount).toBe(1800)
  })
})

describe('propertySchema', () => {
  it('validează câmpurile obligatorii', () => {
    expect(() => propertySchema.parse({ title: 'abc', location: 'B', rent: 1000 })).toThrow()
    const parsed = propertySchema.parse({ title: 'Apartament 2 camere', location: 'București', rent: '1800' })
    expect(parsed.rent).toBe(1800)
  })
})
