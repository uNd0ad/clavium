import * as Sentry from '@sentry/nextjs'

// Hook de pornire Next.js: inițializează Sentry înaintea codului aplicației în runtime-ul
// potrivit, apoi validează mediul Node. Astfel sunt instrumentate și erorile de startup.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
    const { validateEnv } = await import('./lib/env')
    validateEnv()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Capturează erorile din Server Components, route handlers și proxy/middleware.
export const onRequestError = Sentry.captureRequestError
