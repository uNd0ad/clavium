import { basename } from 'node:path'
import { randomBytes } from 'crypto'
import sharp from 'sharp'
import { sha256 } from './hash'
import { getStorageBackend } from './storageBackend'

// Validare + normalizare a imaginilor (sharp), peste un backend de stocare swappable
// (disc în dezvoltare, S3/R2 în producție — vezi storageBackend.ts). Apelanții lucrează doar
// cu URL-uri publice / referințe interne; mutarea în cloud nu le schimbă semnăturile.

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

// Formatele de intrare acceptate, validate după conținutul real (nu după tipul declarat de client).
const ALLOWED_INPUT_FORMATS = new Set(['jpeg', 'png', 'webp'])
// Latura maximă păstrată; imaginile mai mari sunt micșorate. Suficient pentru galerie + retină.
const MAX_DIMENSION = 2560
// Plafon de pixeli la decodare — apără împotriva „decompression bombs" (imagini mici pe disc, uriașe în RAM).
const MAX_INPUT_PIXELS = 50_000_000

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const MAX_PHOTOS_PER_PROPERTY = 8

export const MAX_KYC_BYTES = 8 * 1024 * 1024
// Documentele cerute la verificarea identității (potrivire facială): actul de identitate
// (fața cu poza) și un selfie, capturate live din cameră.
export const KYC_DOCUMENT_KINDS = ['id', 'selfie'] as const
export type KycDocumentKind = (typeof KYC_DOCUMENT_KINDS)[number]

export function photoExtension(mimeType: string): string | null {
  return ALLOWED_TYPES[mimeType] ?? null
}

// Re-encodează fotografia prin sharp: validează că e o imagine reală (după conținut, nu după
// mimeType-ul declarat), aplică orientarea EXIF, elimină metadatele (EXIF/GPS), o micșorează dacă
// e prea mare și o normalizează la WebP. Astfel un fișier ne-imagine deghizat în „image/jpeg" e respins.
export async function savePropertyPhoto(propertyId: string, data: Buffer): Promise<string> {
  let output: Buffer
  try {
    const pipeline = sharp(data, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' })
    const meta = await pipeline.metadata()
    if (!meta.format || !ALLOWED_INPUT_FORMATS.has(meta.format)) {
      throw new Error('unsupported-format')
    }
    output = await pipeline
      .rotate() // aplică orientarea EXIF înainte de a o elimina prin re-encodare
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
  } catch {
    throw new Error('Fișier invalid: trimite o imagine JPEG, PNG sau WebP.')
  }

  const fileName = `${randomBytes(8).toString('hex')}.webp`
  const key = `properties/${propertyId}/${fileName}`
  return getStorageBackend().putPublic(key, output, 'image/webp')
}

export async function deletePropertyPhoto(propertyId: string, url: string): Promise<void> {
  // URL-ul e specific backendului (`/uploads/...` pe disc, URL de bucket în cloud); derivăm cheia
  // din numele fișierului și reconstruim cheia canonică, validând că URL-ul chiar se termină cu ea.
  // Astfel un URL falsificat pentru altă proprietate nu poate șterge fișiere străine.
  const file = basename(url)
  const key = `properties/${propertyId}/${file}`
  if (url.includes('..') || file.includes('/') || !url.endsWith(key)) {
    throw new Error('URL de fotografie invalid.')
  }
  await getStorageBackend().deletePublic(key)
}

// Salvează un document KYC într-o zonă privată (niciodată servită public). Ca la fotografii,
// re-encodează prin sharp: validează că e o imagine reală (după conținut), elimină metadatele
// (EXIF/GPS) și o normalizează la WebP. Întoarce o referință internă + amprenta (sha256) a
// conținutului normalizat — amprenta e ce trimitem furnizorului KYC și ce păstrăm ca audit.
export async function saveKycDocument(
  userId: string,
  kind: KycDocumentKind,
  data: Buffer
): Promise<{ ref: string; hash: string }> {
  let output: Buffer
  try {
    const pipeline = sharp(data, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' })
    const meta = await pipeline.metadata()
    if (!meta.format || !ALLOWED_INPUT_FORMATS.has(meta.format)) {
      throw new Error('unsupported-format')
    }
    output = await pipeline
      .rotate() // aplică orientarea EXIF înainte de a o elimina prin re-encodare
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
  } catch {
    throw new Error('Fișier invalid: trimite o imagine JPEG, PNG sau WebP.')
  }

  const fileName = `${kind}_${randomBytes(8).toString('hex')}.webp`
  const key = `kyc/${userId}/${fileName}`
  await getStorageBackend().putPrivate(key, output, 'image/webp')
  return { ref: key, hash: sha256(output) }
}

// Șterge un document KYC privat (purjarea biometrică la retenție). Idempotentă: absența e ok.
export async function deleteKycDocument(key: string): Promise<void> {
  await getStorageBackend().deletePrivate(key)
}

export function parsePhotos(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}
