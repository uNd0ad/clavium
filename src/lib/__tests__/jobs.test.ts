import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { cleanupExpiredTokens } from '@/lib/jobs'

const past = new Date(Date.now() - 60_000)
const future = new Date(Date.now() + 60 * 60_000)

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
