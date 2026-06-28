import { describe, it, expect, beforeEach } from 'vitest'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { aHash, hammingDistance, isSimilar, recordPhotoSignatures, findStolenPhotoSignals, findDuplicateListingSignals } from '@/lib/fraud'

// Generează o imagine PNG cu un model dat (verticală sau orizontală).
async function patternPng(orientation: 'vertical' | 'horizontal'): Promise<Buffer> {
  const w = 64, h = 64
  const data = Buffer.alloc(w * h * 3)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = (orientation === 'vertical' ? x : y) < (orientation === 'vertical' ? w : h) / 2 ? 0 : 255
      const i = (y * w + x) * 3
      data[i] = data[i + 1] = data[i + 2] = v
    }
  }
  return sharp(data, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer()
}

describe('perceptual hashing', () => {
  it('produce hash-uri de 16 hex și distanță 0 pentru imagini identice', async () => {
    const img = await patternPng('vertical')
    const h1 = await aHash(img)
    const h2 = await aHash(img)
    expect(h1).toHaveLength(16)
    expect(hammingDistance(h1, h2)).toBe(0)
    expect(isSimilar(h1, h2)).toBe(true)
  })

  it('rămâne similar după recompresie (jpeg)', async () => {
    const png = await patternPng('vertical')
    const jpeg = await sharp(png).jpeg({ quality: 70 }).toBuffer()
    expect(isSimilar(await aHash(png), await aHash(jpeg))).toBe(true)
  })

  it('distinge imagini cu structură diferită', async () => {
    const vertical = await aHash(await patternPng('vertical'))
    const horizontal = await aHash(await patternPng('horizontal'))
    expect(hammingDistance(vertical, horizontal)).toBeGreaterThan(8)
    expect(isSimilar(vertical, horizontal)).toBe(false)
  })
})

describe('fraud signals', () => {
  beforeEach(async () => { await resetDb() })

  it('semnalează fotografii care se potrivesc cu listarea altui proprietar', async () => {
    const ownerA = await makeUser('OWNER', `a-${Math.random()}@ex.ro`)
    const ownerB = await makeUser('OWNER', `b-${Math.random()}@ex.ro`)
    const propA = await prisma.property.create({ data: { title: 'A', location: 'Buc', rent: 1000, ownerId: ownerA.id } })
    const hash = await aHash(await patternPng('vertical'))
    await recordPhotoSignatures(propA.id, ownerA.id, [hash])

    // ownerB încarcă aceeași fotografie.
    const signals = await findStolenPhotoSignals([hash], ownerB.id)
    expect(signals).toHaveLength(1)
    expect(signals[0]).toMatchObject({ type: 'STOLEN_PHOTO', matchedPropertyId: propA.id })

    // același proprietar nu se auto-semnalează.
    expect(await findStolenPhotoSignals([hash], ownerA.id)).toHaveLength(0)
  })

  it('semnalează listări aproape identice ca text de la proprietari diferiți', async () => {
    const ownerA = await makeUser('OWNER', `a-${Math.random()}@ex.ro`)
    const ownerB = await makeUser('OWNER', `b-${Math.random()}@ex.ro`)
    await prisma.property.create({ data: { title: 'Apartament 2 camere Centru', location: 'Cluj', rent: 2000, ownerId: ownerA.id } })
    const propB = await prisma.property.create({ data: { title: 'apartament 2 camere centru', location: 'cluj', rent: 2000, ownerId: ownerB.id } })

    const signals = await findDuplicateListingSignals({ id: propB.id, title: propB.title, location: propB.location, ownerId: ownerB.id })
    expect(signals).toHaveLength(1)
    expect(signals[0].type).toBe('DUPLICATE_LISTING')
  })
})
