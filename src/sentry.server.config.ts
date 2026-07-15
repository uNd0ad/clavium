import * as Sentry from '@sentry/nextjs'
import { firstDefined, sentryDataCollection, sentryTraceSampleRate } from './lib/sentryConfig'

const dsn = firstDefined(process.env.SENTRY_DSN, process.env.NEXT_PUBLIC_SENTRY_DSN)

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: firstDefined(process.env.SENTRY_ENVIRONMENT, process.env.VERCEL_ENV, process.env.NODE_ENV),
  tracesSampleRate: sentryTraceSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE),
  dataCollection: sentryDataCollection(),
  includeLocalVariables: false,
  attachStacktrace: true,
})
