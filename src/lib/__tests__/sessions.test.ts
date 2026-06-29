import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb, makeUser } from '@/test/helpers'
import { deviceLabel, getUserSessions, revokeUserSession, revokeOtherSessions } from '@/lib/sessions'
import { isNewDevice } from '@/lib/auth'

const UA_CHROME_WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
const UA_SAFARI_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'

const future = () => new Date(Date.now() + 3600_000)
const past = () => new Date(Date.now() - 3600_000)

describe('deviceLabel', () => {
  it('descrie browser + sistem de operare', () => {
    expect(deviceLabel(UA_CHROME_WIN)).toBe('Chrome pe Windows')
    expect(deviceLabel(UA_SAFARI_IOS)).toBe('Safari pe iPhone')
    expect(deviceLabel('Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0')).toBe('Firefox pe Linux')
    expect(deviceLabel(null)).toBe('Dispozitiv necunoscut')
  })
})

describe('sesiuni / dispozitive', () => {
  beforeEach(async () => { await resetDb() })

  it('isNewDevice: false pe primul login, true pentru un user-agent nemaivăzut', async () => {
    const user = await makeUser('CLIENT', `s-${Math.random()}@ex.ro`)
    // fără istoric → nu alertăm
    expect(await isNewDevice(user.id, UA_CHROME_WIN)).toBe(false)
    await prisma.session.create({ data: { userId: user.id, expiresAt: future(), userAgent: UA_CHROME_WIN } })
    // același dispozitiv → nu e nou
    expect(await isNewDevice(user.id, UA_CHROME_WIN)).toBe(false)
    // alt dispozitiv, cu istoric existent → nou
    expect(await isNewDevice(user.id, UA_SAFARI_IOS)).toBe(true)
  })

  it('getUserSessions listează doar sesiuni active și marchează sesiunea curentă', async () => {
    const user = await makeUser('CLIENT', `s-${Math.random()}@ex.ro`)
    const current = await prisma.session.create({ data: { userId: user.id, expiresAt: future(), userAgent: UA_CHROME_WIN } })
    await prisma.session.create({ data: { userId: user.id, expiresAt: future(), userAgent: UA_SAFARI_IOS } })
    await prisma.session.create({ data: { userId: user.id, expiresAt: past() } }) // expirată
    await prisma.session.create({ data: { userId: user.id, expiresAt: future(), revokedAt: new Date() } }) // revocată

    const list = await getUserSessions(user.id, current.id)
    expect(list).toHaveLength(2)
    expect(list.find((s) => s.id === current.id)?.isCurrent).toBe(true)
    expect(list.filter((s) => s.isCurrent)).toHaveLength(1)
  })

  it('revokeUserSession revocă o sesiune anume (idempotent), fără a atinge altele', async () => {
    const user = await makeUser('CLIENT', `s-${Math.random()}@ex.ro`)
    const a = await prisma.session.create({ data: { userId: user.id, expiresAt: future() } })
    const b = await prisma.session.create({ data: { userId: user.id, expiresAt: future() } })

    expect(await revokeUserSession(user.id, a.id)).toBe(true)
    expect(await revokeUserSession(user.id, a.id)).toBe(false) // deja revocată
    expect((await prisma.session.findUniqueOrThrow({ where: { id: a.id } })).revokedAt).not.toBeNull()
    expect((await prisma.session.findUniqueOrThrow({ where: { id: b.id } })).revokedAt).toBeNull()

    // nu poți revoca sesiunea altui utilizator
    const other = await makeUser('CLIENT', `o-${Math.random()}@ex.ro`)
    expect(await revokeUserSession(other.id, b.id)).toBe(false)
  })

  it('revokeOtherSessions revocă tot în afară de sesiunea curentă', async () => {
    const user = await makeUser('CLIENT', `s-${Math.random()}@ex.ro`)
    const current = await prisma.session.create({ data: { userId: user.id, expiresAt: future() } })
    await prisma.session.create({ data: { userId: user.id, expiresAt: future() } })
    await prisma.session.create({ data: { userId: user.id, expiresAt: future() } })

    const count = await revokeOtherSessions(user.id, current.id)
    expect(count).toBe(2)
    expect((await prisma.session.findUniqueOrThrow({ where: { id: current.id } })).revokedAt).toBeNull()
    expect(await getUserSessions(user.id, current.id)).toHaveLength(1)
  })
})
