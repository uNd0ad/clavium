import { createHash, randomBytes } from 'crypto'

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function randomToken() {
  return randomBytes(32).toString('hex')
}

export function paymentReference() {
  return `TRX-${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`
}
