import { describe, it, expect } from 'vitest'
import { rentCommission, saleCommission, saleCommissionRate, SALE_COMMISSION_MIN } from '@/lib/commission'

describe('rentCommission', () => {
  it('aplică procentul fix (5%)', () => {
    expect(rentCommission(2000)).toBe(100)
    expect(rentCommission(0)).toBe(0)
  })
})

describe('saleCommission', () => {
  it('aplică comisionul minim pe tranzacții mici', () => {
    expect(saleCommission(10_000)).toBe(SALE_COMMISSION_MIN) // 3% din 10k = 300 < min
  })

  it('e degresiv pe tranșe (rata efectivă scade când prețul crește)', () => {
    expect(saleCommissionRate(250_000)).toBeGreaterThan(saleCommissionRate(2_000_000))
  })

  it('calculează corect pe tranșe', () => {
    // 250k @3% = 7.500
    expect(saleCommission(250_000)).toBe(7_500)
    // 500k = 250k@3% + 250k@2.5% = 7.500 + 6.250 = 13.750
    expect(saleCommission(500_000)).toBe(13_750)
    // 1M = 7.500 + 6.250 + 500k@2% (10.000) = 23.750
    expect(saleCommission(1_000_000)).toBe(23_750)
  })

  it('e monoton crescător (fără praguri/cliff)', () => {
    let prev = 0
    for (let price = 0; price <= 5_000_000; price += 25_000) {
      const c = saleCommission(price)
      expect(c).toBeGreaterThanOrEqual(prev)
      prev = c
    }
  })

  it('tratează prețuri nevalide', () => {
    expect(saleCommission(0)).toBe(0)
    expect(saleCommission(-100)).toBe(0)
  })
})
