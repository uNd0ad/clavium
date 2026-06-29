// Backend-ul de stocare a obiectelor (fotografii publice + documente KYC private).
//
// De ce există: pe Vercel sistemul de fișiere e efemer — orice scriere în `public/uploads`
// sau `private/kyc` se pierde la următorul deploy / cold start. Acest modul ascunde IO-ul
// real în spatele unei interfețe stabile, ca `storage.ts` (pipeline-ul sharp + semnăturile)
// să nu se schimbe: în dezvoltare scriem pe disc, în producție într-un bucket S3/R2.
//
// Selecția driverului: STORAGE_DRIVER=s3 activează bucket-ul; orice altceva (implicit) → disc.
// SDK-ul S3 e încărcat leneș, astfel încât dezvoltarea și testele nu depind de el.
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
// `import type` e șters la compilare — SDK-ul se încarcă tot leneș, doar prin `await import` de mai jos.
import type { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export interface StorageBackend {
  // Scrie un obiect public și întoarce URL-ul prin care e servit (intră direct în <img>/next/image).
  putPublic(key: string, body: Buffer, contentType: string): Promise<string>
  // Șterge un obiect public; absența lui nu e o eroare (ștergere idempotentă).
  deletePublic(key: string): Promise<void>
  // Scrie un obiect privat (KYC) — niciodată servit public.
  putPrivate(key: string, body: Buffer, contentType: string): Promise<void>
  // Șterge un obiect privat (purjare KYC); absența lui nu e o eroare (ștergere idempotentă).
  deletePrivate(key: string): Promise<void>
}

// --- Backend local (disc) — implicit în dezvoltare ----------------------------------------

const PUBLIC_ROOT = path.join(process.cwd(), 'public', 'uploads')
const PRIVATE_ROOT = path.join(process.cwd(), 'private')

const localBackend: StorageBackend = {
  async putPublic(key, body) {
    const filePath = path.join(PUBLIC_ROOT, key)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, body)
    return `/uploads/${key}`
  },
  async deletePublic(key) {
    await unlink(path.join(PUBLIC_ROOT, key)).catch(() => {
      // fișierul lipsește de pe disc — ștergerea e oricum un no-op
    })
  },
  async putPrivate(key, body) {
    const filePath = path.join(PRIVATE_ROOT, key)
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, body)
  },
  async deletePrivate(key) {
    await unlink(path.join(PRIVATE_ROOT, key)).catch(() => {
      // fișierul lipsește de pe disc — ștergerea e oricum un no-op
    })
  },
}

// --- Backend S3/R2 — în producție ---------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Stocare S3 neconfigurată: lipsește ${name}.`)
  return value
}

type S3Module = { client: S3Client; Put: typeof PutObjectCommand; Delete: typeof DeleteObjectCommand }

let s3Singleton: S3Module | null = null

async function getS3(): Promise<S3Module> {
  if (s3Singleton) return s3Singleton
  // Import leneș: SDK-ul e necesar doar când STORAGE_DRIVER=s3.
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    region: process.env.STORAGE_S3_REGION || 'auto',
    endpoint: process.env.STORAGE_S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: requireEnv('STORAGE_S3_ACCESS_KEY_ID'),
      secretAccessKey: requireEnv('STORAGE_S3_SECRET_ACCESS_KEY'),
    },
  })
  s3Singleton = { client, Put: PutObjectCommand, Delete: DeleteObjectCommand }
  return s3Singleton
}

// Baza URL publică (CDN / domeniu custom / r2.dev), fără slash final.
function publicBaseUrl(): string {
  return requireEnv('STORAGE_S3_PUBLIC_BASE_URL').replace(/\/$/, '')
}

const s3Backend: StorageBackend = {
  async putPublic(key, body, contentType) {
    const { client, Put } = await getS3()
    await client.send(
      new Put({ Bucket: requireEnv('STORAGE_S3_PUBLIC_BUCKET'), Key: key, Body: body, ContentType: contentType })
    )
    return `${publicBaseUrl()}/${key}`
  },
  async deletePublic(key) {
    const { client, Delete } = await getS3()
    await client.send(new Delete({ Bucket: requireEnv('STORAGE_S3_PUBLIC_BUCKET'), Key: key }))
  },
  async putPrivate(key, body, contentType) {
    const { client, Put } = await getS3()
    await client.send(
      new Put({ Bucket: requireEnv('STORAGE_S3_PRIVATE_BUCKET'), Key: key, Body: body, ContentType: contentType })
    )
  },
  async deletePrivate(key) {
    const { client, Delete } = await getS3()
    await client.send(new Delete({ Bucket: requireEnv('STORAGE_S3_PRIVATE_BUCKET'), Key: key }))
  },
}

// `true` când stocarea e persistentă (S3/R2). Folosit de validarea env la pornire.
export function storageIsPersistent(): boolean {
  return process.env.STORAGE_DRIVER === 's3'
}

export function getStorageBackend(): StorageBackend {
  return storageIsPersistent() ? s3Backend : localBackend
}
