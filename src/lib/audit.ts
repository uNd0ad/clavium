// Registru de audit imuabil, înlănțuit prin hash. Fiecare intrare leagă hash-ul celei anterioare,
// deci ștergerea sau modificarea unei intrări rupe lanțul (detectabil cu `verifyAuditChain`).
// Scrierile sunt serializate cu un advisory lock Postgres ca `seq`/`prevHash` să rămână consistente
// chiar și sub scrieri concurente. Best-effort la apel: o eroare de audit NU trebuie să rupă fluxul
// de business (vezi `recordAuditSafe`).
import { prisma } from './prisma'
import { sha256 } from './hash'
import { logger } from './logger'

const GENESIS = '0'.repeat(64)
// Cheie arbitrară, dar fixă, pentru advisory lock-ul tranzacției (serializează scrierile de audit).
const AUDIT_LOCK_KEY = 91_534

export type AuditAction =
  | 'CONTRACT_SIGNED'
  | 'CONTRACT_ACTIVATED'
  | 'CONTRACT_TERMINATED'
  | 'CONTRACT_RENEWED'
  | 'SALE_CANCELLED'
  | 'TERMS_CHANGED'
  | 'PAYMENT_SETTLED'
  | 'DEPOSIT_RETURNED'
  // Acțiuni administrative.
  | 'KYC_OVERRIDE'
  | 'PROPERTY_MODERATED'
  | 'PAYMENT_REFUNDED'
  | 'REPORT_RESOLVED'

export type AuditEntity = 'CONTRACT' | 'PAYMENT' | 'PROPERTY' | 'INQUIRY' | 'USER'

export type AuditInput = {
  actorId?: string | null
  action: AuditAction
  entityType: AuditEntity
  entityId: string
  metadata?: Record<string, unknown>
}

// Reprezentarea canonică (deterministă) a unei intrări, peste care se calculează hash-ul.
function canonical(e: { seq: number; actorId: string | null; action: string; entityType: string; entityId: string; metadata: string | null; createdAt: string }): string {
  return JSON.stringify([e.seq, e.actorId, e.action, e.entityType, e.entityId, e.metadata, e.createdAt])
}

export async function recordAudit(input: AuditInput): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Serializează scrierile de audit: orice altă tranzacție de audit așteaptă aici.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${AUDIT_LOCK_KEY})`
    const last = await tx.auditLog.findFirst({ orderBy: { seq: 'desc' } })
    const seq = (last?.seq ?? 0) + 1
    const prevHash = last?.hash ?? GENESIS
    const createdAt = new Date()
    const metadata = input.metadata ? JSON.stringify(input.metadata) : null
    const payload = canonical({
      seq,
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata,
      createdAt: createdAt.toISOString(),
    })
    const hash = sha256(`${payload}|${prevHash}`)
    await tx.auditLog.create({
      data: {
        seq,
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        metadata,
        prevHash,
        hash,
        createdAt,
      },
    })
  })
}

// Variantă care nu aruncă niciodată — auditul e secundar fluxului de business.
export async function recordAuditSafe(input: AuditInput): Promise<void> {
  try {
    await recordAudit(input)
  } catch (err) {
    logger.error('audit: înregistrare eșuată', { action: input.action, entityId: input.entityId, error: (err as Error).message })
  }
}

// Verifică integritatea întregului lanț: secvență continuă + hash-uri recalculate corect.
export async function verifyAuditChain(): Promise<{ ok: boolean; brokenAtSeq?: number; count: number }> {
  const entries = await prisma.auditLog.findMany({ orderBy: { seq: 'asc' } })
  let prevHash = GENESIS
  let expectedSeq = 1
  for (const e of entries) {
    if (e.seq !== expectedSeq) return { ok: false, brokenAtSeq: e.seq, count: entries.length }
    const payload = canonical({
      seq: e.seq,
      actorId: e.actorId,
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      metadata: e.metadata,
      createdAt: e.createdAt.toISOString(),
    })
    const expected = sha256(`${payload}|${prevHash}`)
    if (e.prevHash !== prevHash || e.hash !== expected) {
      return { ok: false, brokenAtSeq: e.seq, count: entries.length }
    }
    prevHash = e.hash
    expectedSeq += 1
  }
  return { ok: true, count: entries.length }
}

export type AuditTrailItem = { action: string; actorId: string | null; metadata: unknown; createdAt: Date }

// Istoricul de audit pentru o entitate (ex. un contract), în ordine cronologică.
export async function getAuditTrail(entityType: AuditEntity, entityId: string): Promise<AuditTrailItem[]> {
  const entries = await prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { seq: 'asc' },
    select: { action: true, actorId: true, metadata: true, createdAt: true },
  })
  return entries.map((e) => ({
    action: e.action,
    actorId: e.actorId,
    metadata: e.metadata ? JSON.parse(e.metadata) : null,
    createdAt: e.createdAt,
  }))
}
