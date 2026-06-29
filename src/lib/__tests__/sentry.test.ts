import { describe, it, expect } from 'vitest'
import { SENTRY_ENABLED, reportException } from '@/lib/sentry'
import { captureException } from '@/lib/logger'

describe('observabilitate (Sentry env-gated)', () => {
  it('e dezactivat fără SENTRY_DSN (no-op care nu aruncă)', () => {
    expect(SENTRY_ENABLED).toBe(false)
    expect(() => reportException(new Error('test'), { op: 'x' })).not.toThrow()
  })

  it('captureException loghează și nu aruncă, indiferent de tipul erorii', () => {
    expect(() => captureException(new Error('boom'), { op: 'unit' })).not.toThrow()
    expect(() => captureException('string error')).not.toThrow()
  })
})
