import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { recordKycVerification, submitKycAction } from '@/app/actions/kyc'
import { KYC_MATCH_THRESHOLD } from '@/lib/kyc'
import type { SessionUser } from '@/lib/session'

type DbUser = Awaited<ReturnType<typeof makeUser>>

// Sesiune cu o stare KYC explicită (conturile noi pornesc UNVERIFIED).
function session(user: DbUser, kycStatus: string): SessionUser {
  return { ...sessionFor(user), kycStatus }
}

describe('verificare KYC (mod local: potrivire facială)', () => {
  let user: DbUser

  beforeEach(async () => {
    await resetDb()
    user = await makeUser('CLIENT', 'kyc@client.test')
  })

  it('verifică atunci când fețele se potrivesc (sub prag)', async () => {
    const distance = KYC_MATCH_THRESHOLD - 0.1
    const res = await recordKycVerification(session(user, 'UNVERIFIED'), ['id_hash', 'selfie_hash'], {
      facesDetected: true,
      matchDistance: distance,
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.status).toBe('VERIFIED')

    const record = await prisma.kycVerification.findUniqueOrThrow({ where: { userId: user.id } })
    expect(record.status).toBe('VERIFIED')
    expect(record.provider).toBe('dev')
    expect(record.reference).toMatch(/^kyc_dev_/)
    expect(record.documentCount).toBe(2)
    expect(record.matchScore).toBeCloseTo(distance, 5)
    expect(record.verifiedAt).not.toBeNull()

    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.kycStatus).toBe('VERIFIED')

    const notif = await prisma.notification.findFirst({ where: { userId: user.id, title: 'Identitate verificată' } })
    expect(notif).not.toBeNull()
  })

  it('respinge când fețele nu se potrivesc (peste prag)', async () => {
    const res = await recordKycVerification(session(user, 'UNVERIFIED'), ['id_hash', 'selfie_hash'], {
      facesDetected: true,
      matchDistance: KYC_MATCH_THRESHOLD + 0.2,
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.status).toBe('REJECTED')

    const record = await prisma.kycVerification.findUniqueOrThrow({ where: { userId: user.id } })
    expect(record.status).toBe('REJECTED')
    expect(record.rejectionReason).toBeTruthy()
    expect(record.verifiedAt).toBeNull()

    const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(fresh.kycStatus).toBe('REJECTED')
  })

  it('respinge când nu s-a detectat nicio față', async () => {
    const res = await recordKycVerification(session(user, 'UNVERIFIED'), ['id_hash', 'selfie_hash'], {
      facesDetected: false,
      matchDistance: null,
    })
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.status).toBe('REJECTED')
  })

  it('re-trimiterea actualizează același dosar (un singur rând per utilizator)', async () => {
    await recordKycVerification(session(user, 'UNVERIFIED'), ['a', 'b'], {
      facesDetected: true,
      matchDistance: KYC_MATCH_THRESHOLD + 0.3,
    })
    await recordKycVerification(session(user, 'REJECTED'), ['c', 'd'], {
      facesDetected: true,
      matchDistance: KYC_MATCH_THRESHOLD - 0.2,
    })

    const records = await prisma.kycVerification.findMany({ where: { userId: user.id } })
    expect(records).toHaveLength(1)
    expect(records[0].status).toBe('VERIFIED')
    expect(JSON.parse(records[0].documentHashes)).toEqual(['c', 'd'])
  })

  it('refuză re-verificarea unui cont deja verificat', async () => {
    setUser(session(user, 'VERIFIED'))
    const res = await submitKycAction(new FormData())
    expect(res.ok).toBe(false)
  })

  it('cere consimțământul biometric explicit (GDPR art. 9)', async () => {
    setUser(session(user, 'UNVERIFIED'))
    const res = await submitKycAction(new FormData()) // fără consent
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/biometric/i)
  })

  it('cere documentele când lipsesc din formular (cu consimțământ dat)', async () => {
    setUser(session(user, 'UNVERIFIED'))
    const form = new FormData()
    form.append('consent', 'true')
    const res = await submitKycAction(form)
    expect(res.ok).toBe(false)
  })
})
