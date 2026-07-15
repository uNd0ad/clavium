// TOTP (RFC 6238) implementat peste `crypto` din Node — fără dependențe externe. Compatibil cu
// aplicațiile de autentificare (Google Authenticator, Authy, 1Password): SHA-1, pas de 30s, 6 cifre.
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const STEP_SECONDS = 30
const DIGITS = 6
const ISSUER = 'Vatrio'

// Alfabetul base32 (RFC 4648), folosit pentru secret (formatul așteptat de aplicațiile TOTP).
const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return Buffer.from(out)
}

// Secret nou (160 biți), în base32 — formatul pe care îl așteaptă aplicațiile de autentificare.
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20))
}

// HOTP (RFC 4226): codul pentru un contor dat.
function hotp(key: Buffer, counter: number): string {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64BE(BigInt(counter))
  const digest = createHmac('sha1', key).update(buf).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  return (code % 10 ** DIGITS).toString().padStart(DIGITS, '0')
}

// Codul TOTP curent pentru un secret (util la teste / generare).
export function generateTotp(secret: string, now: number = Date.now()): string {
  const counter = Math.floor(now / 1000 / STEP_SECONDS)
  return hotp(base32Decode(secret), counter)
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

// Verifică un cod, tolerând o fereastră de ±`window` pași (derivă de ceas / latență). Comparație
// în timp constant.
export function verifyTotp(secret: string, token: string, opts: { now?: number; window?: number } = {}): boolean {
  const clean = (token ?? '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(clean)) return false
  const now = opts.now ?? Date.now()
  const window = opts.window ?? 1
  const key = base32Decode(secret)
  const counter = Math.floor(now / 1000 / STEP_SECONDS)
  for (let i = -window; i <= window; i++) {
    if (safeEqual(hotp(key, counter + i), clean)) return true
  }
  return false
}

// URI `otpauth://` pe care îl codăm în QR pentru înrolarea în aplicația de autentificare.
export function totpAuthUri(secret: string, account: string, issuer: string = ISSUER): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}
