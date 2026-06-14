import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'

// Rulează o singură dată înainte de teste: recreează schema în baza de date de test izolată.
export default function setup() {
  const testDb = path.join(process.cwd(), 'prisma', 'test.db')
  rmSync(testDb, { force: true })
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: `file:${testDb}` },
  })
}
