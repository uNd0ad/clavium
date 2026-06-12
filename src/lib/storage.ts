import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

// Storage local pe disc (public/uploads). În producție se înlocuiește cu S3/R2
// păstrând aceleași semnături — apelanții lucrează doar cu URL-uri publice.

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads')

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const MAX_PHOTOS_PER_PROPERTY = 8

export function photoExtension(mimeType: string): string | null {
  return ALLOWED_TYPES[mimeType] ?? null
}

export async function savePropertyPhoto(propertyId: string, data: Buffer, mimeType: string): Promise<string> {
  const ext = photoExtension(mimeType)
  if (!ext) throw new Error('Format de imagine neacceptat. Folosește JPEG, PNG sau WebP.')

  const fileName = `${randomBytes(8).toString('hex')}${ext}`
  const dir = path.join(UPLOADS_ROOT, 'properties', propertyId)
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, fileName), data)
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

export function parsePhotos(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}
