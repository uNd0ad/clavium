import * as Sentry from '@sentry/nextjs'
import { firstDefined, sentryDataCollection, sentryTraceSampleRate } from './lib/sentryConfig'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: firstDefined(process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT, process.env.NODE_ENV),
  tracesSampleRate: sentryTraceSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE),

  // Clavium procesează date KYC și financiare. Nu colectăm IP/user implicit și nu activăm
  // Session Replay; breadcrumbs și erorile tehnice rămân suficiente pentru diagnosticare.
  dataCollection: sentryDataCollection(),
  attachStacktrace: true,
})

// Leagă navigările App Router de trace-urile server și API.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
