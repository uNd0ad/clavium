import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import sharp from 'sharp'
import { sha256 } from './hash'

// Storage local pe disc (public/uploads). În producție se înlocuiește cu S3/R2
// păstrând aceleași semnături — apelanții lucrează doar cu URL-uri publice.

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads')
// Documentele KYC (act de identitate, selfie) sunt sensibile: NU se servesc public.
// Stocare privată, în afara `public/`. În producție se înlocuiește cu un bucket privat (S3/R2).
const PRIVATE_ROOT = path.join(process.cwd(), 'private', 'kyc')

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
// Documentele cerute la verificarea identității, în ordinea pașilor din formular.
export const KYC_DOCUMENT_KINDS = ['id_front', 'id_back', 'selfie'] as const
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
  const dir = path.join(UPLOADS_ROOT, 'properties', propertyId)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, fileName), output)
  return `/uploads/properties/${propertyId}/${fileName}`
}

export async function deletePropertyPhoto(propertyId: string, url: string): Promise<void> {
  const prefix = `/uploads/properties/${propertyId}/`
  if (!url.startsWith(prefix) || url.includes('..')) {
    throw new Error('URL de fotografie invalid.')
  }
  const filePath = path.join(UPLOADS_ROOT, 'properties', propertyId, path.basename(url))
  await unlink(filePath).catch(() => {
    // fișierul lipsește de pe disc — eliminăm doar referința
  })
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
  const dir = path.join(PRIVATE_ROOT, userId)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, fileName), output)
  return { ref: `kyc/${userId}/${fileName}`, hash: sha256(output) }
}

export function parsePhotos(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}
