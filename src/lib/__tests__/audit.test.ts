import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetDb } from '@/test/helpers'
import { recordAudit, verifyAuditChain, getAuditTrail } from '@/lib/audit'

describe('audit log (hash-chained)', () => {
  beforeEach(async () => { await resetDb() })

  it('înlănțuie intrările secvențial și verifică integritatea', async () => {
    await recordAudit({ action: 'CONTRACT_SIGNED', entityType: 'CONTRACT', entityId: 'c1', actorId: 'u1' })
    await recordAudit({ action: 'PAYMENT_SETTLED', entityType: 'PAYMENT', entityId: 'p1', metadata: { amount: 100 } })
    await recordAudit({ action: 'CONTRACT_ACTIVATED', entityType: 'CONTRACT', entityId: 'c1' })

    const entries = await prisma.auditLog.findMany({ orderBy: { seq: 'asc' } })
    expect(entries.map((e) => e.seq)).toEqual([1, 2, 3])
    expect(entries[0].prevHash).toBe('0'.repeat(64))
    expect(entries[1].prevHash).toBe(entries[0].hash)
    expect(entries[2].prevHash).toBe(entries[1].hash)

    const check = await verifyAuditChain()
    expect(check.ok).toBe(true)
    expect(check.count).toBe(3)
  })

  it('detectează modificarea (tamper) unei intrări', async () => {
    await recordAudit({ action: 'CONTRACT_SIGNED', entityType: 'CONTRACT', entityId: 'c1' })
    await recordAudit({ action: 'PAYMENT_SETTLED', entityType: 'PAYMENT', entityId: 'p1', metadata: { amount: 100 } })

    // Falsifică metadata primei intrări fără a reface hash-ul → lanțul devine inconsistent.
    const first = await prisma.auditLog.findFirstOrThrow({ where: { seq: 1 } })
    await prisma.auditLog.update({ where: { id: first.id }, data: { metadata: JSON.stringify({ tampered: true }) } })

    const check = await verifyAuditChain()
    expect(check.ok).toBe(false)
    expect(check.brokenAtSeq).toBe(1)
  })

  it('întoarce istoricul unei entități în ordine cronologică', async () => {
    await recordAudit({ action: 'CONTRACT_SIGNED', entityType: 'CONTRACT', entityId: 'cX' })
    await recordAudit({ action: 'PAYMENT_SETTLED', entityType: 'PAYMENT', entityId: 'pX' })
    await recordAudit({ action: 'CONTRACT_ACTIVATED', entityType: 'CONTRACT', entityId: 'cX' })

    const trail = await getAuditTrail('CONTRACT', 'cX')
    expect(trail.map((t) => t.action)).toEqual(['CONTRACT_SIGNED', 'CONTRACT_ACTIVATED'])
  })
})
