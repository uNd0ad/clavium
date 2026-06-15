import { execSync } from 'node:child_process'
import { TEST_DATABASE_URL } from './env'

// Rulează o singură dată înainte de teste: sincronizează structura în schema de test izolată
// (`clavium_test`). `db push` creează schema dacă lipsește; curățarea datelor o face resetDb.
export default function setup() {
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL, DIRECT_URL: TEST_DATABASE_URL },
  })
}
