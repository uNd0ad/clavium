import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { TERMS_VERSION, hasAcceptedCurrentTerms, recordTermsConsent } from '@/lib/terms'

describe('T&C consent', () => {
  beforeEach(async () => { await resetDb() })

  it('un utilizator nou nu a acceptat versiunea curentă până nu o înregistrează', async () => {
    const user = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
    expect(await hasAcceptedCurrentTerms(user.id)).toBe(false)

    await recordTermsConsent(user.id)
    expect(await hasAcceptedCurrentTerms(user.id)).toBe(true)
  })

  it('înregistrarea consimțământului e idempotentă', async () => {
    const user = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
    await recordTermsConsent(user.id)
    await recordTermsConsent(user.id)
    expect(await prisma.termsConsent.count({ where: { userId: user.id } })).toBe(1)
  })

  it('consimțământul pentru o versiune veche nu acoperă versiunea curentă', async () => {
    const user = await makeUser('CLIENT', `t-${Math.random()}@ex.ro`)
    await recordTermsConsent(user.id, '2000-01-01')
    expect(await hasAcceptedCurrentTerms(user.id)).toBe(false)
    await recordTermsConsent(user.id, TERMS_VERSION)
    expect(await hasAcceptedCurrentTerms(user.id)).toBe(true)
  })
})
