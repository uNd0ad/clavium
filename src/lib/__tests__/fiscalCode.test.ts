import { describe, expect, it } from 'vitest'
import { isValidCui, isValidRegNumber } from '../fiscalCode'

describe('isValidCui', () => {
  it('acceptă un CUI cu cifră de control corectă (cu și fără prefix RO)', () => {
    expect(isValidCui('13548146')).toBe(true)
    expect(isValidCui('RO13548146')).toBe(true)
    expect(isValidCui(' ro 13548146 ')).toBe(true)
  })

  it('respinge cifra de control greșită', () => {
    expect(isValidCui('13548147')).toBe(false)
  })

  it('respinge formate invalide', () => {
    expect(isValidCui('abc')).toBe(false)
    expect(isValidCui('1')).toBe(false) // prea scurt
    expect(isValidCui('12345678901')).toBe(false) // prea lung (>10)
  })
})

describe('isValidRegNumber', () => {
  it('acceptă numere de înregistrare valide', () => {
    expect(isValidRegNumber('J40/1234/2020')).toBe(true)
    expect(isValidRegNumber('J12/45/1999')).toBe(true)
    expect(isValidRegNumber('F40/1/2021')).toBe(true)
  })

  it('respinge formate invalide', () => {
    expect(isValidRegNumber('40/1234/2020')).toBe(false) // fără prefix
    expect(isValidRegNumber('J40-1234-2020')).toBe(false) // separatori greșiți
    expect(isValidRegNumber('J40/1234')).toBe(false) // lipsește anul
  })
})
