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
    // Fișierele de test partajează aceeași bază de date — rulează-le serial ca să nu se suprascrie.
    fileParallelism: false,
    env: {
      // Schemă de test izolată pe Postgres + secret valid pentru orice cod care îl cere.
      DATABASE_URL: TEST_DATABASE_URL,
      DIRECT_URL: TEST_DATABASE_URL,
      JWT_SECRET: TEST_JWT_SECRET,
    },
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
