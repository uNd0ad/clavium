/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Camera permisă pe origine proprie pentru verificarea identității (KYC: captură live act + selfie).
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),
]

// În producție, fotografiile sunt servite dintr-un bucket (S3/R2) prin STORAGE_S3_PUBLIC_BASE_URL.
// next/image acceptă doar host-uri declarate aici — derivăm host-ul din baza URL configurată.
function publicImagePatterns() {
  const base = process.env.STORAGE_S3_PUBLIC_BASE_URL
  if (!base) return []
  try {
    const url = new URL(base)
    return [{ protocol: url.protocol.replace(':', ''), hostname: url.hostname }]
  } catch {
    return []
  }
}

const nextConfig = {
  images: {
    remotePatterns: publicImagePatterns(),
  },
  experimental: {
    // Permite încărcarea fotografiilor prin Server Actions: până la 8 imagini × 5 MB
    // (vezi MAX_PHOTO_BYTES / MAX_PHOTOS_PER_PROPERTY în src/lib/storage.ts) plus overhead multipart.
    serverActions: {
      bodySizeLimit: '45mb',
    },
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.227'],
  // Fonturile Noto Sans (citite prin fs în contractPdf.ts) trebuie incluse în bundle-ul
  // funcției serverless care generează PDF-ul — altfel readFileSync eșuează în producție.
  // Idem șabloanele de contract (config/contracts/*.md, citite de contractTemplate.ts) pentru
  // PDF și pentru pagina contractului.
  outputFileTracingIncludes: {
    '/api/contracte/[id]/pdf': ['./src/assets/fonts/**', './config/contracts/**'],
    '/api/plati/[id]/chitanta': ['./src/assets/fonts/**'],
    '/dashboard/contracte/[id]': ['./config/contracts/**'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = withSentryConfig(nextConfig, {
  // SENTRY_ORG, SENTRY_PROJECT și SENTRY_AUTH_TOKEN sunt citite și automat de plugin.
  // Le trecem explicit ca documentația configurației să rămână lângă cod.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload-ul rulează la build când credențialele sunt prezente. Hărțile client sunt șterse
  // după upload, iar cele server rămân doar în artefactul privat pentru simbolizare la runtime.
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Evenimentele browser trec prin aceeași origine, ca să nu fie blocate de ad blockers.
  // Ruta este exclusă explicit din proxy-ul aplicației (src/proxy.ts).
  tunnelRoute: '/monitoring',

  // Release-ul este dedus de plugin din SENTRY_RELEASE, Vercel sau commit-ul git.
  release: {
    create: true,
    finalize: true,
  },

  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Păstrăm build-urile locale silențioase; CI afișează upload-ul și orice eroare aferentă.
  silent: !process.env.CI,
})
