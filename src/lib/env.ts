// Validare a variabilelor de mediu la pornirea serverului (apelată din src/instrumentation.ts).
// Scop: un deploy de producție configurat greșit pică imediat și vizibil, în loc să ruleze cu
// funcții care eșuează silențios (vezi PRODUCTION-READINESS.md, P0 #1 / P1 #5).
// Notă: JWT_SECRET e validat separat, la import, în constants.ts — acolo acoperă și runtime-ul
// edge (proxy.ts), care nu trece prin acest hook de pornire.
import { logger } from './logger'
import { qesConfigured } from './qesVerify'
import { storageIsPersistent } from './storageBackend'

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.includes('your_') || value.includes('changeme')
}

export function validateEnv(): void {
  if (process.env.NODE_ENV !== 'production') return

  // Hard-fail: fără acestea aplicația nu poate funcționa deloc.
  const missing: string[] = []
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!process.env.DIRECT_URL) missing.push('DIRECT_URL')
  if (missing.length > 0) {
    throw new Error(`Variabile de mediu obligatorii lipsă în producție: ${missing.join(', ')}.`)
  }

  // Avertismente zgomotoase: furnizorii de livrare sunt necesari ca utilizatorii să primească
  // OTP / emailuri. Nu blocăm pornirea (poate fi un deploy parțial, în curs de configurare), dar
  // la apel email.ts / sms.ts aruncă în producție dacă tot nu sunt configurați.
  const warnings: string[] = []
  if (!process.env.SMTP_HOST || isPlaceholder(process.env.SMTP_PASS)) {
    warnings.push('Email neconfigurat (SMTP_HOST / SMTP_USER / SMTP_PASS) — emailurile vor eșua.')
  }
  if (!process.env.APP_URL && !process.env.VERCEL_URL) {
    warnings.push('APP_URL nesetat — linkurile absolute (verificare email, resetare parolă, sitemap) vor indica localhost.')
  }
  if (!process.env.SMS_API_URL || !process.env.SMS_API_KEY || !process.env.SMS_SENDER_ID) {
    warnings.push('SMS neconfigurat (SMS_API_URL / SMS_API_KEY / SMS_SENDER_ID) — OTP-ul prin SMS va eșua.')
  }
  if (isPlaceholder(process.env.STRIPE_SECRET_KEY) || isPlaceholder(process.env.STRIPE_WEBHOOK_SECRET)) {
    warnings.push('Stripe neconfigurat (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET) — plățile vor fi decontate instant în „mod dev”, fără încasare reală.')
  }
  if (process.env.CSP_DISABLED === '1' && process.env.VERCEL === '1') {
    warnings.push('CSP_DISABLED=1 e ignorat pe Vercel — CSP rămâne activ (vezi proxy.ts).')
  }
  if (!process.env.CRON_SECRET) {
    warnings.push('CRON_SECRET nesetat — rutele /api/cron/* resping cererile, deci curățarea/dunning-ul programat nu rulează.')
  }
  if (!qesConfigured()) {
    warnings.push('Magazinul de certificate QES e gol (config/qes-trust) — semnarea contractelor va fi refuzată.')
  }
  if (!storageIsPersistent()) {
    warnings.push('Stocare neconfigurată (STORAGE_DRIVER≠s3) — fotografiile și documentele KYC se scriu pe disc efemer și se pierd la redeploy.')
  } else {
    const storageMissing = [
      'STORAGE_S3_ACCESS_KEY_ID',
      'STORAGE_S3_SECRET_ACCESS_KEY',
      'STORAGE_S3_PUBLIC_BUCKET',
      'STORAGE_S3_PRIVATE_BUCKET',
      'STORAGE_S3_PUBLIC_BASE_URL',
    ].filter((name) => !process.env[name])
    if (storageMissing.length > 0) {
      warnings.push(`Stocare S3 incompletă: lipsesc ${storageMissing.join(', ')} — încărcările vor eșua.`)
    }
  }
  for (const w of warnings) logger.warn(`[env] ${w}`)
}
