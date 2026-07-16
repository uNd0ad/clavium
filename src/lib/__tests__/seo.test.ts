import { describe, it, expect } from 'vitest'
import { absoluteUrl, formatMemberSince, listingJsonLd } from '@/lib/seo'

const base = {
  id: 'p1',
  title: 'Apartament 2 camere',
  description: 'Frumos, central.',
  location: 'Cluj-Napoca',
  rooms: 2,
  surface: 55,
  photos: JSON.stringify(['/uploads/a.webp', 'https://cdn.ex/b.webp']),
}

describe('seo', () => {
  it('absoluteUrl produce URL-uri absolute fără slash dublu', () => {
    expect(absoluteUrl('/proprietati/1')).toMatch(/\/proprietati\/1$/)
    expect(absoluteUrl('proprietati/1')).toMatch(/\/proprietati\/1$/)
    expect(absoluteUrl('/x')).not.toContain('//x')
  })

  it('JSON-LD pentru vânzare: tip rezidență + ofertă în RON cu prețul de vânzare', () => {
    const ld = listingJsonLd({ ...base, transactionType: 'VANZARE', status: 'DISPONIBILA', price: 120000, rent: 0 })
    expect(ld['@type']).toBe('SingleFamilyResidence')
    expect(ld.name).toBe('Apartament 2 camere')
    expect(ld.numberOfRooms).toBe(2)
    expect(Array.isArray(ld.image)).toBe(true)
    expect((ld.offers as { price: number; priceCurrency: string; availability: string }).price).toBe(120000)
    expect((ld.offers as { priceCurrency: string }).priceCurrency).toBe('RON')
    expect((ld.offers as { availability: string }).availability).toContain('InStock')
  })

  it('JSON-LD pentru închiriere: apartament + chiria lunară ca ofertă', () => {
    const ld = listingJsonLd({ ...base, transactionType: 'INCHIRIERE', status: 'INCHIRIATA', price: 0, rent: 1800 })
    expect(ld['@type']).toBe('Apartment')
    expect((ld.offers as { price: number }).price).toBe(1800)
    expect((ld.offers as { availability: string }).availability).toContain('OutOfStock')
  })

  it('fotografiile relative devin absolute, cele http rămân neschimbate', () => {
    const ld = listingJsonLd({ ...base, transactionType: 'VANZARE', status: 'DISPONIBILA', price: 100, rent: 0 })
    const images = ld.image as string[]
    expect(images[0]).toMatch(/^https?:\/\/.+\/uploads\/a\.webp$/)
    expect(images[1]).toBe('https://cdn.ex/b.webp')
  })

  it('formatează data serializată din cache și tratează defensiv o valoare invalidă', () => {
    expect(formatMemberSince('2025-06-10T12:00:00.000Z')).toMatch(/iunie 2025/)
    expect(formatMemberSince('invalid')).toBe('—')
  })
})
