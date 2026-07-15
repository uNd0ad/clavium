import * as Sentry from '@sentry/nextjs'

export const SENTRY_ENABLED = Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)

// Punctul stabil folosit de logger și de boundary-urile React. SDK-ul este inițializat o singură
// dată de fișierul runtime potrivit; fără DSN apelul rămâne un no-op sincron.
export function reportException(error: unknown, context?: Record<string, unknown>): void {
  if (!SENTRY_ENABLED) return
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined)
  } catch {
    // Observabilitatea nu are voie să mascheze eroarea originală sau să rupă un error boundary.
  }
}
