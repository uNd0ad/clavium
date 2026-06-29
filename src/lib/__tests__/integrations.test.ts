import { describe, it, expect } from 'vitest'
import { approximate, displayCoordinates, hasCoordinates, MAPS_ENABLED } from '@/lib/maps'
import { detectSource, parseListingHtml } from '@/lib/import'
import { buildCommissionInvoiceXml } from '@/lib/efactura'
import { ownerNetFromRent, PAYOUTS_ENABLED } from '@/lib/payouts'
import { rentCommission } from '@/lib/commission'

describe('maps (scaffold)', () => {
  it('e dezactivat fără cheie', () => {
    expect(MAPS_ENABLED).toBe(false)
  })
  it('aproximează coordonatele pentru listări neexclusive, exact pentru exclusive', () => {
    expect(approximate({ lat: 46.770439, lng: 23.591423 })).toEqual({ lat: 46.77, lng: 23.59 })
    expect(displayCoordinates({ lat: 46.770439, lng: 23.591423, isExclusive: true })).toEqual({ lat: 46.770439, lng: 23.591423 })
    expect(displayCoordinates({ lat: 46.770439, lng: 23.591423, isExclusive: false })).toEqual({ lat: 46.77, lng: 23.59 })
  })
  it('hasCoordinates discriminează null-urile', () => {
    expect(hasCoordinates({ lat: 1, lng: 2 })).toBe(true)
    expect(hasCoordinates({ lat: null, lng: 2 })).toBe(false)
  })
})

describe('listing import (scaffold)', () => {
  it('detectează sursa după domeniu', () => {
    expect(detectSource('https://www.olx.ro/d/oferta/x')).toBe('olx')
    expect(detectSource('https://www.storia.ro/ro/oferta/x')).toBe('storia')
    expect(detectSource('https://www.imobiliare.ro/x')).toBe('imobiliare')
    expect(detectSource('https://example.com')).toBe('unknown')
  })
  it('extrage câmpuri din OpenGraph + heuristici', () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Apartament 3 camere Cluj" />
        <meta property="og:description" content="Frumos, central." />
        <meta property="product:price:amount" content="185000" />
      </head><body>3 camere · 78 mp</body></html>`
    const out = parseListingHtml('https://www.storia.ro/ro/oferta/x', html)
    expect(out).toMatchObject({ source: 'storia', title: 'Apartament 3 camere Cluj', price: 185000, rooms: 3, surface: 78 })
  })
})

describe('e-Factura (scaffold)', () => {
  it('construiește XML UBL valid cu TVA și totaluri corecte', () => {
    const xml = buildCommissionInvoiceXml({
      number: 'CLV-2026-001',
      issueDate: '2026-06-29',
      currency: 'RON',
      amount: 100,
      vatRate: 19,
      supplier: { name: 'Clavium SRL', cui: 'RO12345678', address: 'Timișoara' },
      customer: { name: 'Proprietar SRL', cui: 'RO87654321', address: 'Cluj' },
      description: 'Comision intermediere',
    })
    expect(xml).toContain('<cbc:ID>CLV-2026-001</cbc:ID>')
    expect(xml).toContain('RO12345678')
    expect(xml).toContain('<cbc:TaxAmount currencyID="RON">19.00</cbc:TaxAmount>')
    expect(xml).toContain('<cbc:PayableAmount currencyID="RON">119.00</cbc:PayableAmount>')
    // Caracterele speciale sunt escapate.
    expect(buildCommissionInvoiceXml({ number: 'A&B', issueDate: '2026-01-01', currency: 'RON', amount: 1, vatRate: 19, supplier: { name: 'X', cui: 'Y', address: 'Z' }, customer: { name: 'C', cui: 'D', address: 'E' }, description: '<x>' })).toContain('A&amp;B')
  })
})

describe('payouts (scaffold)', () => {
  it('e dezactivat fără Connect și calculează corect netul proprietarului', () => {
    expect(PAYOUTS_ENABLED).toBe(false)
    expect(ownerNetFromRent(1000)).toBe(1000 - rentCommission(1000))
    expect(ownerNetFromRent(0)).toBe(0)
  })
})
