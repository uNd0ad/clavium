// Integrare Sentry (APM) env-gated. Activă DOAR când `SENTRY_DSN` e setat ȘI pachetul
// `@sentry/nextjs` e instalat. Pachetul e încărcat printr-un import dinamic ascuns de bundler
// (prin `new Function`), ca să rămână o dependență opțională: aplicația compilează și rulează
// identic fără el. Când vrei observabilitate reală: `npm i @sentry/nextjs`, setează `SENTRY_DSN`
// (+ opțional `SENTRY_TRACES_SAMPLE_RATE`) și adaugă fișierele de config recomandate de Sentry.
import { logger } from './logger'

export const SENTRY_ENABLED = Boolean(process.env.SENTRY_DSN)

type SentryModule = {
  init: (options: Record<string, unknown>) => void
  captureException: (error: unknown, hint?: { extra?: Record<string, unknown> }) => void
}

// Import dinamic invizibil pentru bundler (nu încearcă să rezolve pachetul la build).
const importOptional = new Function('m', 'return import(m)') as (m: string) => Promise<unknown>

let client: SentryModule | null = null
let loadPromise: Promise<void> | null = null

async function load(): Promise<void> {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  try {
    const mod = (await importOptional('@sentry/nextjs')) as SentryModule
    mod.init({
      dsn,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
      environment: process.env.NODE_ENV,
    })
    client = mod
  } catch {
    // Pachetul nu e instalat — rămânem pe logul structurat (captureException îl scrie oricum).
    logger.warn('sentry: SENTRY_DSN setat, dar @sentry/nextjs nu e instalat — rulează `npm i @sentry/nextjs`')
  }
}

// Trimite o excepție către Sentry, best-effort și non-blocant. No-op fără SENTRY_DSN.
export function reportException(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_ENABLED) return
  if (!loadPromise) loadPromise = load()
  loadPromise
    .then(() => client?.captureException(error, context ? { extra: context } : undefined))
    .catch(() => {})
}
