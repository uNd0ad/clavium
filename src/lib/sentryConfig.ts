const DEFAULT_TRACE_SAMPLE_RATE = 0.1

// Variabilele de mediu sunt text; o valoare invalidă nu trebuie să dezactiveze accidental
// tracing-ul și nici să facă SDK-ul să refuze pornirea.
export function sentryTraceSampleRate(value: string | undefined): number {
  if (!value?.trim()) return DEFAULT_TRACE_SAMPLE_RATE
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : DEFAULT_TRACE_SAMPLE_RATE
}

export function firstDefined(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => Boolean(value?.trim()))
}

// Opt-in explicit pentru minimizarea datelor. Astfel o schimbare de default în SDK nu poate
// activa accidental cookies, antete, query params, body-uri sau variabile locale din stack.
export function sentryDataCollection() {
  return {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: false, response: false },
    httpBodies: [],
    queryParams: false,
    genAI: { inputs: false, outputs: false },
    stackFrameVariables: false,
  }
}
