import { defineConfig } from 'vitest/config'
import path from 'node:path'

const root = process.cwd()
const testDb = path.join(root, 'prisma', 'test.db')

export default defineConfig({
  resolve: {
    alias: { '@': path.join(root, 'src') },
  },
  test: {
    environment: 'node',
    // Fișierele de test partajează aceeași bază de date — rulează-le serial ca să nu se suprascrie.
    fileParallelism: false,
    env: {
      // Bază de date de test izolată + secret valid pentru orice cod care îl cere.
      DATABASE_URL: `file:${testDb}`,
      JWT_SECRET: 'test_secret_minimum_32_characters_long_0123',
    },
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
