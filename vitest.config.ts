import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { TEST_DATABASE_URL, TEST_JWT_SECRET } from './src/test/env'

const root = process.cwd()

export default defineConfig({
  resolve: {
    alias: { '@': path.join(root, 'src') },
  },
  test: {
    environment: 'node',
    // Doar testele unitare/integrare din `src`. Specurile Playwright din `e2e/` rulează separat
    // (npm run test:e2e) — altfel Vitest le-ar prelua și ar eșua la importul `@playwright/test`.
    include: ['src/**/*.test.ts'],
    // Fișierele de test partajează aceeași bază de date — rulează-le serial ca să nu se suprascrie.
    fileParallelism: false,
    env: {
      // Schemă de test izolată pe Postgres + secret valid pentru orice cod care îl cere.
      DATABASE_URL: TEST_DATABASE_URL,
      DIRECT_URL: TEST_DATABASE_URL,
      JWT_SECRET: TEST_JWT_SECRET,
      // Forțăm „modul dev" pentru plăți: testele de ciclu decontează pe loc (settlePayment),
      // nu prin redirect Stripe + webhook. Altfel cheile Stripe din `.env`-ul local ar fi
      // încărcate de Vitest și ar ruta plățile spre Checkout, lăsându-le IN_CURS.
      STRIPE_SECRET_KEY: '',
      STRIPE_WEBHOOK_SECRET: '',
      // Ancore de încredere QES de test (CA self-signed din fixtures) + OCSP dezactivat în teste.
      QES_TRUST_DIR: path.join(root, 'src/test/fixtures/qes/trust'),
      QES_OCSP_DISABLED: '1',
    },
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      reportOnFailure: true,
      include: [
        'src/lib/**/*.ts',
        'src/app/actions/**/*.ts',
        'src/app/api/**/*.ts',
        'src/proxy.ts',
        'src/instrumentation.ts',
        'src/instrumentation-client.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/__tests__/**',
        'src/test/**',
        // Copii istorice neimportate; nu fac parte din bundle-ul aplicației.
        'src/lib/**/* 2.ts',
      ],
      thresholds: {
        lines: 50,
        statements: 50,
        functions: 50,
        branches: 40,
      },
    },
  },
})
