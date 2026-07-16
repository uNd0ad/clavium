import { readFileSync } from 'node:fs'
import path from 'node:path'
import { webcrypto } from 'node:crypto'
import { hash } from 'bcryptjs'
import { prisma } from '../../src/lib/prisma'
import { resetDb } from '../../src/test/helpers'
import { TERMS_VERSION } from '../../src/lib/terms'

export const E2E_PASSWORD = 'Vatrio-e2e-2026!'
export const E2E_ACCOUNTS = {
  owner: { email: 'owner@money-path.test', role: 'OWNER' as const },
  client: { email: 'client@money-path.test', role: 'CLIENT' as const },
}

const QES_FIXTURES = path.join(process.cwd(), 'src/test/fixtures/qes')
export const QES_CERTIFICATE_PATH = path.join(QES_FIXTURES, 'leaf.crt')
const qesKeyPem = readFileSync(path.join(QES_FIXTURES, 'leaf.key.pem'), 'utf8')

function assertDisposableDatabase() {
  if (process.env.E2E_DATABASE_RESET !== '1') {
    throw new Error('Refuz resetarea bazei: setează E2E_DATABASE_RESET=1 numai pentru baza E2E izolată.')
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL lipsește pentru fixture-urile E2E.')

  const parsed = new URL(databaseUrl)
  const local = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
  const isolatedSchema = parsed.searchParams.get('schema') === 'vatrio_e2e'
  if (!local && !isolatedSchema) {
    throw new Error(`Refuz resetarea bazei non-locale fără schema dedicată vatrio_e2e (${parsed.hostname}).`)
  }
}

export function moneyPathEnabled() {
  return process.env.E2E_MONEY_PATH === '1'
}

export async function resetAndSeedMoneyPath() {
  assertDisposableDatabase()
  await resetDb()

  const passwordHash = await hash(E2E_PASSWORD, 10)
  const [owner, client] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Olivia',
        lastName: 'Owner',
        email: E2E_ACCOUNTS.owner.email,
        passwordHash,
        role: E2E_ACCOUNTS.owner.role,
        emailVerified: true,
        phoneVerified: true,
        kycStatus: 'VERIFIED',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Cristian',
        lastName: 'Client',
        email: E2E_ACCOUNTS.client.email,
        passwordHash,
        role: E2E_ACCOUNTS.client.role,
        emailVerified: true,
        phoneVerified: true,
        kycStatus: 'VERIFIED',
      },
    }),
  ])

  await prisma.termsConsent.createMany({
    data: [
      { userId: owner.id, version: TERMS_VERSION },
      { userId: client.id, version: TERMS_VERSION },
    ],
  })

  return { owner, client }
}

export async function cleanMoneyPath() {
  assertDisposableDatabase()
  await resetDb()
}

function pemToDer(pem: string): ArrayBuffer {
  const bytes = Buffer.from(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''), 'base64')
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

let qesKeyPromise: Promise<webcrypto.CryptoKey> | null = null
function qesKey() {
  if (!qesKeyPromise) {
    qesKeyPromise = webcrypto.subtle.importKey(
      'pkcs8',
      pemToDer(qesKeyPem),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )
  }
  return qesKeyPromise
}

export async function signDocumentHash(documentHash: string) {
  const key = await qesKey()
  const signature = await webcrypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(documentHash)
  )
  return Buffer.from(signature).toString('base64')
}

export { prisma }
