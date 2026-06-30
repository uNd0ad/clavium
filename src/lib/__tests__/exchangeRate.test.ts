import { describe, it, expect, afterEach } from 'vitest'
import { parseBnrEurRon, getEurRonRate } from '@/lib/exchangeRate'

const SAMPLE = `<?xml version="1.0" encoding="utf-8"?>
<DataSet xmlns="http://www.bnr.ro/xsd/nbrfxrates.xsd">
  <Body>
    <OrigCurrency>RON</OrigCurrency>
    <Cube date="2026-06-29">
      <Rate currency="AED" multiplier="10">12.3456</Rate>
      <Rate currency="EUR">4.9760</Rate>
      <Rate currency="USD">4.5500</Rate>
    </Cube>
  </Body>
</DataSet>`

const ORIGINAL = process.env.EUR_RON_RATE

describe('curs BNR (EUR/RON)', () => {
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.EUR_RON_RATE
    else process.env.EUR_RON_RATE = ORIGINAL
  })

  it('extrage cursul EUR din feed-ul BNR', () => {
    expect(parseBnrEurRon(SAMPLE)).toBeCloseTo(4.976, 4)
  })

  it('aplică multiplier-ul când există (ex. EUR cotat la 10)', () => {
    expect(parseBnrEurRon('<Cube><Rate currency="EUR" multiplier="10">49.76</Rate></Cube>')).toBeCloseTo(4.976, 4)
  })

  it('aruncă dacă EUR lipsește din feed', () => {
    expect(() => parseBnrEurRon('<Cube><Rate currency="USD">4.55</Rate></Cube>')).toThrow()
  })

  it('EUR_RON_RATE setat are prioritate (override manual, fără rețea)', async () => {
    process.env.EUR_RON_RATE = '5.25'
    expect(await getEurRonRate()).toBe(5.25)
  })
})
