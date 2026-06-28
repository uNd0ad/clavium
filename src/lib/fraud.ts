// Detecția fraudei la listări: amprente perceptuale de imagine (aHash) pentru a depista
// fotografii furate / listări duplicat, plus listări aproape identice ca text.
import sharp from 'sharp'
import { prisma } from './prisma'
import { logger } from './logger'
import { createSystemReport } from './reports'

// Distanța Hamming maximă (din 64 de biți) pentru care două imagini sunt considerate „aceeași".
// aHash e grosier; un prag mic reduce fals-pozitivele.
const DUPLICATE_THRESHOLD = 8

// Average hash (aHash): redimensionează la 8×8 grayscale, comparand fiecare pixel cu media →
// 64 de biți împachetați în 16 caractere hex. Robust la redimensionare/recompresie ușoară.
export async function aHash(image: Buffer): Promise<string> {
  const pixels = await sharp(image, { failOn: 'error' })
    .grayscale()
    .resize(8, 8, { fit: 'fill' })
    .raw()
    .toBuffer()
  let sum = 0
  for (const p of pixels) sum += p
  const mean = sum / pixels.length
  let bits = ''
  for (const p of pixels) bits += p > mean ? '1' : '0'
  // 64 de biți → 16 hex.
  let hex = ''
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16)
  return hex
}

const POPCOUNT = Array.from({ length: 16 }, (_, n) => n.toString(2).split('').filter((b) => b === '1').length)

// Distanța Hamming între două aHash-uri hex (numărul de biți care diferă).
export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 64
  let dist = 0
  for (let i = 0; i < a.length; i++) {
    dist += POPCOUNT[parseInt(a[i], 16) ^ parseInt(b[i], 16)]
  }
  return dist
}

export function isSimilar(a: string, b: string, threshold = DUPLICATE_THRESHOLD): boolean {
  return hammingDistance(a, b) <= threshold
}

// Stochează amprentele fotografiilor unei listări.
export async function recordPhotoSignatures(propertyId: string, ownerId: string, hashes: string[]): Promise<void> {
  if (hashes.length === 0) return
  await prisma.photoSignature.createMany({
    data: hashes.map((hash) => ({ propertyId, ownerId, hash })),
  })
}

export type FraudSignal =
  | { type: 'STOLEN_PHOTO'; matchedPropertyId: string; matchedOwnerId: string }
  | { type: 'DUPLICATE_LISTING'; matchedPropertyId: string; matchedOwnerId: string }

// Caută fotografii ale ALTOR proprietari care se potrivesc (Hamming mic) cu amprentele date.
export async function findStolenPhotoSignals(hashes: string[], excludeOwnerId: string): Promise<FraudSignal[]> {
  if (hashes.length === 0) return []
  // Comparăm față de toate amprentele altor proprietari. La scară mare s-ar folosi LSH/bucketing;
  // pentru volumul actual, o scanare e suficientă și simplă.
  const others = await prisma.photoSignature.findMany({
    where: { ownerId: { not: excludeOwnerId } },
    select: { hash: true, propertyId: true, ownerId: true },
  })
  const seen = new Set<string>()
  const signals: FraudSignal[] = []
  for (const h of hashes) {
    for (const o of others) {
      if (isSimilar(h, o.hash) && !seen.has(o.propertyId)) {
        seen.add(o.propertyId)
        signals.push({ type: 'STOLEN_PHOTO', matchedPropertyId: o.propertyId, matchedOwnerId: o.ownerId })
      }
    }
  }
  return signals
}

// Listări aproape identice ca text (titlu + locație) ale altor proprietari.
export async function findDuplicateListingSignals(
  property: { id: string; title: string; location: string; ownerId: string }
): Promise<FraudSignal[]> {
  const matches = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      ownerId: { not: property.ownerId },
      title: { equals: property.title, mode: 'insensitive' },
      location: { equals: property.location, mode: 'insensitive' },
    },
    select: { id: true, ownerId: true },
    take: 5,
  })
  return matches.map((m) => ({ type: 'DUPLICATE_LISTING' as const, matchedPropertyId: m.id, matchedOwnerId: m.ownerId }))
}

// Rulează toate verificările pentru o listare nouă/actualizată și notifică adminii la semnale.
// Best-effort: nu trebuie să blocheze încărcarea fotografiilor.
export async function runFraudChecks(
  property: { id: string; title: string; location: string; ownerId: string },
  newPhotoHashes: string[]
): Promise<FraudSignal[]> {
  try {
    const [stolen, duplicates] = await Promise.all([
      findStolenPhotoSignals(newPhotoHashes, property.ownerId),
      findDuplicateListingSignals(property),
    ])
    const signals = [...stolen, ...duplicates]
    if (signals.length > 0) {
      logger.warn('fraud: semnale la listare', { propertyId: property.id, signals: signals.map((s) => s.type) })
      const summary = signals.some((s) => s.type === 'STOLEN_PHOTO')
        ? 'fotografii care se potrivesc cu altă listare'
        : 'listare aproape identică cu alta'
      // Intră în coada de moderare (raportare de sistem, deduplicată pe țintă) și notifică adminii.
      const created = await createSystemReport(
        'PROPERTY',
        property.id,
        `Detecție automată: ${summary}. Semnale: ${signals.map((s) => s.type).join(', ')}.`
      )
      if (created) {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } })
        await prisma.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            title: 'Posibilă fraudă la o listare',
            description: `Listarea „${property.title}” a generat semnale de fraudă (${summary}).`,
            variant: 'warning',
          })),
        })
      }
    }
    return signals
  } catch (err) {
    logger.error('fraud: verificarea a eșuat', { propertyId: property.id, error: (err as Error).message })
    return []
  }
}
