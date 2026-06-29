import { describe, it, expect, afterEach } from 'vitest'
import { ronToEur, eurToRon, formatRon, formatEur, formatMoney, formatRonWithEur, isCurrency, eurRonRate } from '@/lib/currency'

const ORIGINAL = process.env.EUR_RON_RATE

describe('currency', () => {
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.EUR_RON_RATE
    else process.env.EUR_RON_RATE = ORIGINAL
  })

  it('folosește cursul din env, cu fallback rezonabil', () => {
    process.env.EUR_RON_RATE = '5'
    expect(eurRonRate()).toBe(5)
    expect(ronToEur(1000)).toBe(200)
    expect(eurToRon(200)).toBe(1000)

    process.env.EUR_RON_RATE = 'nonsense'
    expect(eurRonRate()).toBeGreaterThan(0) // fallback
  })

  it('formatează RON și EUR', () => {
    expect(formatRon(1500)).toBe('1.500 RON')
    expect(formatEur(50000)).toBe('50.000 €')
  })

  it('formatMoney convertește în valuta cerută', () => {
    process.env.EUR_RON_RATE = '5'
    expect(formatMoney(1000, 'RON')).toBe('1.000 RON')
    expect(formatMoney(1000, 'EUR')).toBe('200 €')
  })

  it('formatRonWithEur arată ambele valute', () => {
    process.env.EUR_RON_RATE = '5'
    expect(formatRonWithEur(250000)).toBe('250.000 RON (~50.000 €)')
  })

  it('isCurrency validează codurile', () => {
    expect(isCurrency('RON')).toBe(true)
    expect(isCurrency('EUR')).toBe(true)
    expect(isCurrency('USD')).toBe(false)
  })
})
