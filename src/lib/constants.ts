export const COOKIE_NAME = 'clavium_token'

const secret = process.env.JWT_SECRET
if (process.env.NODE_ENV === 'production' && (!secret || secret === 'dev_secret_clavium' || secret.length < 32)) {
  throw new Error('JWT_SECRET trebuie setat în producție (minim 32 de caractere).')
}
export const JWT_SECRET = secret ?? 'dev_secret_clavium'

export const APP_URL = process.env.APP_URL ?? 'http://localhost:3000'
export const COMMISSION_PERCENT = 5
