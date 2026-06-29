import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { reportAction, resolveReportAction } from '@/app/actions/reports'
import { getReports, countOpenReports, createSystemReport } from '@/lib/reports'

async function listing() {
  const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({ data: { title: 'Ap', location: 'Buc', rent: 1500, ownerId: owner.id } })
  return { owner, property }
}

describe('reports / flag + admin queue', () => {
  beforeEach(async () => { await resetDb() })

  it('creează o sesizare pentru o listare și notifică adminii', async () => {
    const admin = await makeUser('ADMIN', `adm-${Math.random()}@ex.ro`)
    const reporter = await makeUser('CLIENT', `r-${Math.random()}@ex.ro`)
    const { property } = await listing()

    setUser(sessionFor(reporter))
    const res = await reportAction('PROPERTY', property.id, 'FRAUD', 'Pare o țeapă.')
    expect(res.ok).toBe(true)

    const queue = await getReports('DESCHIS')
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ targetType: 'PROPERTY', targetId: property.id, reason: 'FRAUD', reporterName: 'Test CLIENT', targetLabel: 'Ap' })
    expect(await prisma.notification.count({ where: { userId: admin.id } })).toBe(1)
  })

  it('este idempotent per autor + țintă (nu dublează sesizările deschise)', async () => {
    const reporter = await makeUser('CLIENT', `r-${Math.random()}@ex.ro`)
    const { property } = await listing()
    setUser(sessionFor(reporter))
    await reportAction('PROPERTY', property.id, 'SPAM')
    const second = await reportAction('PROPERTY', property.id, 'FRAUD')
    expect(second.ok).toBe(true)
    expect(second.ok && second.alreadyReported).toBe(true)
    expect(await countOpenReports()).toBe(1)
  })

  it('respinge motive/ținte invalide și auto-raportarea', async () => {
    const reporter = await makeUser('CLIENT', `r-${Math.random()}@ex.ro`)
    setUser(sessionFor(reporter))
    expect((await reportAction('PROPERTY', 'inexistent', 'FRAUD')).ok).toBe(false)
    expect((await reportAction('GHOST', reporter.id, 'FRAUD')).ok).toBe(false)
    expect((await reportAction('PROPERTY', (await listing()).property.id, 'NOPE')).ok).toBe(false)
    expect((await reportAction('USER', reporter.id, 'SPAM')).ok).toBe(false) // nu te raportezi pe tine
  })

  it('un admin rezolvă o sesizare și o scoate din coadă', async () => {
    const admin = await makeUser('ADMIN', `adm-${Math.random()}@ex.ro`)
    const reporter = await makeUser('CLIENT', `r-${Math.random()}@ex.ro`)
    const { property } = await listing()
    setUser(sessionFor(reporter))
    await reportAction('PROPERTY', property.id, 'FRAUD')
    const open = await getReports('DESCHIS')

    setUser(sessionFor(admin))
    const res = await resolveReportAction(open[0].id, 'REZOLVAT')
    expect(res.ok).toBe(true)
    expect(await countOpenReports()).toBe(0)
    // rezolvarea e auditată
    expect(await prisma.auditLog.count({ where: { action: 'REPORT_RESOLVED' } })).toBe(1)
    // a doua rezolvare eșuează (deja rezolvată)
    expect((await resolveReportAction(open[0].id, 'RESPINS')).ok).toBe(false)
  })

  it('un ne-admin nu poate rezolva sesizări', async () => {
    const reporter = await makeUser('CLIENT', `r-${Math.random()}@ex.ro`)
    const { property } = await listing()
    setUser(sessionFor(reporter))
    await reportAction('PROPERTY', property.id, 'FRAUD')
    const open = await getReports('DESCHIS')
    expect((await resolveReportAction(open[0].id, 'REZOLVAT')).ok).toBe(false)
  })

  it('sesizările de sistem se deduplică pe țintă cât timp sunt deschise', async () => {
    const { property } = await listing()
    expect(await createSystemReport('PROPERTY', property.id, 'auto 1')).toBe(true)
    expect(await createSystemReport('PROPERTY', property.id, 'auto 2')).toBe(false)
    expect(await countOpenReports()).toBe(1)
  })
})
