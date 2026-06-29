import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { begin2faSetupAction, confirm2faAction, disable2faAction } from '@/app/actions/twofactor'
import { generateTotp } from '@/lib/totp'
import { verifyTwoFactor, hashBackupCode } from '@/lib/twoFactor'

describe('2FA (TOTP) — activare, login, dezactivare', () => {
  beforeEach(async () => { await resetDb() })

  it('parcurge configurarea: secret → confirmare → activ, cu coduri de rezervă', async () => {
    const user = await makeUser('CLIENT', `2fa-${Math.random()}@ex.ro`)
    setUser(sessionFor(user))

    const begin = await begin2faSetupAction()
    expect(begin.ok).toBe(true)
    if (!begin.ok) return
    expect(begin.uri).toContain('otpauth://')

    // Cod greșit → respins, 2FA rămâne inactiv.
    expect((await confirm2faAction('000000')).ok).toBe(false)
    let fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.totpEnabled).toBe(false)

    // Cod corect din secret → activ + coduri de rezervă.
    const confirm = await confirm2faAction(generateTotp(begin.secret))
    expect(confirm.ok).toBe(true)
    if (!confirm.ok) return
    expect(confirm.backupCodes).toHaveLength(8)

    fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.totpEnabled).toBe(true)
    expect(fresh.totpSecret).toBe(begin.secret)
    // Stocăm doar amprentele codurilor de rezervă, nu codurile în clar.
    const storedHashes: string[] = JSON.parse(fresh.totpBackupCodes)
    expect(storedHashes).toContain(hashBackupCode(confirm.backupCodes[0]))
    expect(storedHashes).not.toContain(confirm.backupCodes[0])
  })

  it('verifyTwoFactor acceptă TOTP și consumă un cod de rezervă o singură dată', async () => {
    const user = await makeUser('CLIENT', `2fa-${Math.random()}@ex.ro`)
    setUser(sessionFor(user))
    const begin = await begin2faSetupAction()
    if (!begin.ok) throw new Error('setup failed')
    const confirm = await confirm2faAction(generateTotp(begin.secret))
    if (!confirm.ok) throw new Error('confirm failed')

    const reload = () => prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { id: true, totpSecret: true, totpBackupCodes: true } })

    // TOTP valid.
    expect(await verifyTwoFactor(await reload(), generateTotp(begin.secret))).toBe(true)
    // Cod 2FA invalid.
    expect(await verifyTwoFactor(await reload(), '000000')).toBe(false)

    // Cod de rezervă: prima oară merge, a doua oară nu (consum unic).
    const backup = confirm.backupCodes[0]
    expect(await verifyTwoFactor(await reload(), backup)).toBe(true)
    expect(await verifyTwoFactor(await reload(), backup)).toBe(false)
  })

  it('dezactivarea cere un cod valid', async () => {
    const user = await makeUser('CLIENT', `2fa-${Math.random()}@ex.ro`)
    setUser(sessionFor(user))
    const begin = await begin2faSetupAction()
    if (!begin.ok) throw new Error('setup failed')
    await confirm2faAction(generateTotp(begin.secret))

    expect((await disable2faAction('000000')).ok).toBe(false)
    expect((await disable2faAction(generateTotp(begin.secret))).ok).toBe(true)

    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.totpEnabled).toBe(false)
    expect(fresh.totpSecret).toBeNull()
    expect(fresh.totpBackupCodes).toBe('[]')
  })
})
