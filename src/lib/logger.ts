// Logger structurat. În producție emite JSON pe o linie (ușor de parsat de Vercel/Datadog/agregatoare);
// în dev rămâne lizibil. `captureException` e punctul unic pentru erorile neașteptate — log structurat
// local și îl transmite către Sentry când integrarea este configurată.
type Level = 'info' | 'warn' | 'error'
type Meta = Record<string, unknown>

const isProd = process.env.NODE_ENV === 'production'

function emit(level: Level, message: string, meta?: Meta) {
  const sink = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  if (isProd) {
    sink(JSON.stringify({ level, message, time: new Date().toISOString(), ...meta }))
  } else {
    sink(`[${level.toUpperCase()}] ${message}`, meta && Object.keys(meta).length ? meta : '')
  }
}

export const logger = {
  info: (message: string, meta?: Meta) => emit('info', message, meta),
  warn: (message: string, meta?: Meta) => emit('warn', message, meta),
  error: (message: string, meta?: Meta) => emit('error', message, meta),
}

// Pentru erori neașteptate (bug-uri, dependențe căzute). Erorile „de business” așteptate
// (validări, reguli refuzate) nu trebuie să treacă pe aici — sunt zgomot.
export function captureException(error: unknown, context?: Meta) {
  const err = error instanceof Error ? error : new Error(String(error))
  logger.error(err.message, { ...context, stack: err.stack })
  // Import leneș: logger-ul rămâne utilizabil și în timpul inițializării runtime-ului.
  void import('./sentry').then((m) => m.reportException(err, context)).catch(() => {})
}
