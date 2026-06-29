import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { cleanupExpiredTokens, purgeKycBiometrics } from '@/lib/jobs'

const past = new Date(Date.now() - 60_000)
const future = new Date(Date.now() + 60 * 60_000)
const DAY_MS = 86_400_000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS)

describe('cleanupExpiredTokens', () => {
  beforeEach(async () => {
    await resetDb()
  })

  it('șterge OTP/jetoane/sesiuni expirate sau consumate, dar le păstrează pe cele valide', async () => {
    const user = await makeUser('OWNER', `cron-${Date.now()}@exemplu.ro`)

    await prisma.otp.create({ data: { email: user.email, code: 'h', expiresAt: past } })
    await prisma.otp.create({ data: { email: user.email, code: 'h', expiresAt: future } })
    await prisma.phoneOtp.create({ data: { phone: '0700000000', code: 'h', expiresAt: past } })
    await prisma.emailToken.create({ data: { userId: user.id, token: `t1-${Date.now()}`, type: 'VERIFY_EMAIL', expiresAt: future, usedAt: new Date() } })
    await prisma.emailToken.create({ data: { userId: user.id, token: `t2-${Date.now()}`, type: 'VERIFY_EMAIL', expiresAt: future } })
    await prisma.session.create({ data: { userId: user.id, expiresAt: past } })
    await prisma.session.create({ data: { userId: user.id, expiresAt: future, revokedAt: new Date() } })
    const liveSession = await prisma.session.create({ data: { userId: user.id, expiresAt: future } })

    const result = await cleanupExpiredTokens()

    expect(result.otp).toBe(1)
    expect(result.phoneOtp).toBe(1)
    expect(result.emailTokens).toBe(1) // cel folosit
    expect(result.sessions).toBe(2) // expirat + revocat

    expect(await prisma.otp.count()).toBe(1)
    expect(await prisma.emailToken.count()).toBe(1)
    const sessions = await prisma.session.findMany()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].id).toBe(liveSession.id)
  })
})

describe('purgeKycBiometrics (retenție GDPR)', () => {
  beforeEach(async () => {
    await resetDb()
  })

  async function kycRecord(opts: { status: string; submittedAt: Date; keys: string[] }) {
    const user = await makeUser('CLIENT', `kyc-${Math.random()}@ex.ro`)
    await prisma.kycVerification.create({
      data: {
        userId: user.id,
        status: opts.status,
        provider: 'dev',
        reference: `kyc_${Math.random().toString(36).slice(2)}`,
        documentHashes: JSON.stringify(['h1', 'h2']),
        documentKeys: JSON.stringify(opts.keys),
        documentCount: 2,
        biometricConsentAt: opts.submittedAt,
        submittedAt: opts.submittedAt,
      },
    })
    return user
  }

  it('purjează imaginile brute ale dosarelor finalizate ieșite din retenție și e idempotent', async () => {
    const old = await kycRecord({ status: 'VERIFIED', submittedAt: daysAgo(40), keys: ['kyc/a/id.webp', 'kyc/a/selfie.webp'] })

    const res = await purgeKycBiometrics()
    expect(res).toEqual({ purged: 1, filesDeleted: 2 })

    const rec = await prisma.kycVerification.findUniqueOrThrow({ where: { userId: old.id } })
    expect(JSON.parse(rec.documentKeys)).toEqual([]) // chei golite
    expect(rec.biometricPurgedAt).not.toBeNull()
    expect(rec.status).toBe('VERIFIED') // decizia + amprentele rămân
    expect(JSON.parse(rec.documentHashes)).toEqual(['h1', 'h2'])

    // A doua rulare nu mai reprocesează nimic.
    expect(await purgeKycBiometrics()).toEqual({ purged: 0, filesDeleted: 0 })
  })

  it('nu purjează dosarele din fereastra de retenție și nici pe cele nefinalizate', async () => {
    await kycRecord({ status: 'VERIFIED', submittedAt: daysAgo(5), keys: ['kyc/b/id.webp'] }) // prea recent
    await kycRecord({ status: 'PENDING', submittedAt: daysAgo(40), keys: ['kyc/c/id.webp'] }) // nefinalizat

    const res = await purgeKycBiometrics()
    expect(res).toEqual({ purged: 0, filesDeleted: 0 })
    expect(await prisma.kycVerification.count({ where: { biometricPurgedAt: { not: null } } })).toBe(0)
  })
})
