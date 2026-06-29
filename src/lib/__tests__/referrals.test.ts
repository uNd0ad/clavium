import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { ensureReferralCode, applyReferral, getReferralStats } from '@/lib/referrals'

describe('referrals', () => {
  beforeEach(async () => { await resetDb() })

  it('generează un cod unic și stabil per cont', async () => {
    const user = await makeUser('CLIENT', `r-${Math.random()}@ex.ro`)
    const code = await ensureReferralCode(user.id)
    expect(code).toMatch(/^[A-Z2-9]{8}$/)
    // idempotent: același cod la al doilea apel
    expect(await ensureReferralCode(user.id)).toBe(code)
  })

  it('leagă un utilizator nou de recomandator și notifică', async () => {
    const referrer = await makeUser('CLIENT', `ref-${Math.random()}@ex.ro`)
    const code = await ensureReferralCode(referrer.id)
    const newUser = await makeUser('CLIENT', `new-${Math.random()}@ex.ro`)

    await applyReferral(newUser.id, code.toLowerCase()) // case-insensitive
    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: newUser.id } })
    expect(fresh.referredById).toBe(referrer.id)
    expect(await prisma.notification.count({ where: { userId: referrer.id, title: 'Recomandare nouă' } })).toBe(1)

    const stats = await getReferralStats(referrer.id)
    expect(stats.count).toBe(1)
    expect(stats.code).toBe(code)
  })

  it('ignoră coduri inexistente și auto-recomandarea', async () => {
    const user = await makeUser('CLIENT', `r-${Math.random()}@ex.ro`)
    const code = await ensureReferralCode(user.id)
    await applyReferral(user.id, code) // self
    await applyReferral(user.id, 'NUEXISTA')
    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.referredById).toBeNull()
  })
})
