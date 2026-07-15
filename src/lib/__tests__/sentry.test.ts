import { describe, it, expect } from 'vitest'
import { SENTRY_ENABLED, reportException } from '@/lib/sentry'
import { captureException } from '@/lib/logger'
import { firstDefined, sentryDataCollection, sentryTraceSampleRate } from '@/lib/sentryConfig'

describe('observabilitate (Sentry env-gated)', () => {
  it('e dezactivat fără SENTRY_DSN (no-op care nu aruncă)', () => {
    expect(SENTRY_ENABLED).toBe(false)
    expect(() => reportException(new Error('test'), { op: 'x' })).not.toThrow()
  })

  it('captureException loghează și nu aruncă, indiferent de tipul erorii', () => {
    expect(() => captureException(new Error('boom'), { op: 'unit' })).not.toThrow()
    expect(() => captureException('string error')).not.toThrow()
  })

  it('validează rata de sampling și revine sigur la 10%', () => {
    expect(sentryTraceSampleRate('0')).toBe(0)
    expect(sentryTraceSampleRate('1')).toBe(1)
    expect(sentryTraceSampleRate('0.25')).toBe(0.25)
    expect(sentryTraceSampleRate('invalid')).toBe(0.1)
    expect(sentryTraceSampleRate('2')).toBe(0.1)
  })

  it('alege prima valoare de mediu definită', () => {
    expect(firstDefined(undefined, '', 'production', 'fallback')).toBe('production')
  })

  it('dezactivează explicit colectarea datelor sensibile', () => {
    expect(sentryDataCollection()).toMatchObject({
      userInfo: false,
      cookies: false,
      httpBodies: [],
      queryParams: false,
      stackFrameVariables: false,
    })
  })
})
