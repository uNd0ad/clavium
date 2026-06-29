/** @type {import('next').NextConfig} */
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
  outputFileTracingIncludes: {
    '/api/contracte/[id]/pdf': ['./src/assets/fonts/**'],
    '/api/plati/[id]/chitanta': ['./src/assets/fonts/**'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = nextConfig
