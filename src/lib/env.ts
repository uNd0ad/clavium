// Validare a variabilelor de mediu la pornirea serverului (apelată din src/instrumentation.ts).
// Scop: un deploy de producție configurat greșit pică imediat și vizibil, în loc să ruleze cu
// funcții care eșuează silențios (vezi PRODUCTION-READINESS.md, P0 #1 / P1 #5).
// Notă: JWT_SECRET e validat separat, la import, în constants.ts — acolo acoperă și runtime-ul
// edge (proxy.ts), care nu trece prin acest hook de pornire.
import { logger } from './logger'
import { qesConfigured } from './qesVerify'

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
  if (!process.env.SMS_API_URL || !process.env.SMS_API_KEY || !process.env.SMS_SENDER_ID) {
    warnings.push('SMS neconfigurat (SMS_API_URL / SMS_API_KEY / SMS_SENDER_ID) — OTP-ul prin SMS va eșua.')
  }
  if (process.env.CSP_DISABLED === '1' && process.env.VERCEL === '1') {
    warnings.push('CSP_DISABLED=1 e ignorat pe Vercel — CSP rămâne activ (vezi proxy.ts).')
  }
  if (!qesConfigured()) {
    warnings.push('Magazinul de certificate QES e gol (config/qes-trust) — semnarea contractelor va fi refuzată.')
  }
  for (const w of warnings) logger.warn(`[env] ${w}`)
}
