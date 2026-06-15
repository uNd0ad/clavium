import { loadEnv } from 'vite'

// URL-ul bazei de date pentru teste. Folosim o SCHEMĂ dedicată (`clavium_test`) pe aceeași bază,
// ca testele (care golesc tabelele) să nu atingă datele de dezvoltare din schema `public`.
// Conexiunea e directă (fără pooler) — `db push`/migrațiile nu merg prin PgBouncer.
const fileEnv = loadEnv('test', process.cwd(), '')

const direct =
  process.env.DIRECT_URL || process.env.DATABASE_URL || fileEnv.DIRECT_URL || fileEnv.DATABASE_URL || ''

function withSchema(url: string, schema: string) {
  if (!url) return url
  return `${url}${url.includes('?') ? '&' : '?'}schema=${schema}`
}

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || withSchema(direct, 'clavium_test')

// Secret valid (≥32 car.) pentru orice cod care îl cere în teste.
export const TEST_JWT_SECRET = 'test_secret_minimum_32_characters_long_0123'
