import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { recordKycVerification, submitKycAction } from '@/app/actions/kyc'
import type { SessionUser } from '@/lib/session'

type DbUser = Awaited<ReturnType<typeof makeUser>>

// Sesiune cu o stare KYC explicită (conturile noi pornesc UNVERIFIED).
function session(user: DbUser, kycStatus: string): SessionUser {
  return { ...sessionFor(user), kycStatus }
}

describe('verificare KYC (mod dev): dosar + stare utilizator', () => {
  let user: DbUser

  beforeEach(async () => {
    await resetDb()
    user = await makeUser('CLIENT', 'kyc@client.test')
  })

  it('aprobă instant în mod dev și înregistrează dosarul + starea pe utilizator', async () => {
    const res = await recordKycVerification(session(user, 'UNVERIFIED'), ['ha', 'hb', 'hc'])
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.status).toBe('VERIFIED')

    const record = await prisma.kycVerification.findUniqueOrThrow({ where: { userId: user.id } })
    expect(record.status).toBe('VERIFIED')
    expect(record.provider).toBe('dev')
    expect(record.reference).toMatch(/^kyc_dev_/)
    expect(record.documentCount).toBe(3)
    expect(JSON.parse(record.documentHashes)).toEqual(['ha', 'hb', 'hc'])
    expect(record.verifiedAt).not.toBeNull()

    // Coloana de citire rapidă de pe utilizator e aliniată.
    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.kycStatus).toBe('VERIFIED')

    // Utilizatorul primește o notificare de confirmare.
    const notif = await prisma.notification.findFirst({ where: { userId: user.id, title: 'Identitate verificată' } })
    expect(notif).not.toBeNull()
  })

  it('re-trimiterea actualizează același dosar (un singur rând per utilizator)', async () => {
    await recordKycVerification(session(user, 'UNVERIFIED'), ['ha', 'hb', 'hc'])
    await recordKycVerification(session(user, 'VERIFIED'), ['x1', 'x2', 'x3'])

    const records = await prisma.kycVerification.findMany({ where: { userId: user.id } })
    expect(records).toHaveLength(1)
    expect(JSON.parse(records[0].documentHashes)).toEqual(['x1', 'x2', 'x3'])
  })

  it('refuză re-verificarea unui cont deja verificat', async () => {
    setUser(session(user, 'VERIFIED'))
    const res = await submitKycAction(new FormData())
    expect(res.ok).toBe(false)
  })

  it('cere toate documentele când lipsesc din formular', async () => {
    setUser(session(user, 'UNVERIFIED'))
    const res = await submitKycAction(new FormData())
    expect(res.ok).toBe(false)
  })
})
