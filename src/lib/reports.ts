// Sesizări de abuz/fraudă (report/flag) pentru listări sau utilizatori, plus coada de moderare.
// Raportările pot fi create de utilizatori (reporterId = autorul) sau de sistem (reporterId = null,
// din detecția automată de fraudă — vezi runFraudChecks). Adminii le rezolvă din coadă.
import { prisma } from './prisma'

export const REPORT_REASONS = ['SPAM', 'FRAUD', 'INAPPROPRIATE', 'OTHER'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

// Motivul generat automat de detecția de fraudă; nu poate fi ales de un utilizator.
export const FRAUD_AUTO_REASON = 'FRAUD_AUTO'

export const REPORT_TARGETS = ['PROPERTY', 'USER'] as const
export type ReportTarget = (typeof REPORT_TARGETS)[number]

export const REPORT_STATUSES = ['DESCHIS', 'REZOLVAT', 'RESPINS'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export type ReportListItem = {
  id: string
  reporterId: string | null
  reporterName: string | null
  targetType: string
  targetId: string
  targetLabel: string
  reason: string
  details: string | null
  status: string
  createdAt: Date
}

// Coada de moderare: raportările cu o stare dată (implicit cele deschise), cele mai noi primele,
// îmbogățite cu numele autorului și o etichetă lizibilă pentru țintă (titlu listare / nume utilizator).
export async function getReports(status: ReportStatus = 'DESCHIS', take = 100): Promise<ReportListItem[]> {
  const reports = await prisma.report.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    take,
    include: { reporter: { select: { firstName: true, lastName: true } } },
  })
  if (reports.length === 0) return []

  // Rezolvăm etichetele țintelor în câte o singură interogare per tip.
  const propertyIds = reports.filter((r) => r.targetType === 'PROPERTY').map((r) => r.targetId)
  const userIds = reports.filter((r) => r.targetType === 'USER').map((r) => r.targetId)
  const [properties, users] = await Promise.all([
    propertyIds.length
      ? prisma.property.findMany({ where: { id: { in: propertyIds } }, select: { id: true, title: true } })
      : Promise.resolve([]),
    userIds.length
      ? prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, firstName: true, lastName: true } })
      : Promise.resolve([]),
  ])
  const propertyById = new Map(properties.map((p) => [p.id, p.title]))
  const userById = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]))

  return reports.map((r) => ({
    id: r.id,
    reporterId: r.reporterId,
    reporterName: r.reporter ? `${r.reporter.firstName} ${r.reporter.lastName}` : null,
    targetType: r.targetType,
    targetId: r.targetId,
    targetLabel:
      r.targetType === 'PROPERTY'
        ? propertyById.get(r.targetId) ?? '(listare ștearsă)'
        : userById.get(r.targetId) ?? '(utilizator șters)',
    reason: r.reason,
    details: r.details,
    status: r.status,
    createdAt: r.createdAt,
  }))
}

// Numărul de raportări deschise — pentru badge-uri în panoul de administrare.
export async function countOpenReports(): Promise<number> {
  return prisma.report.count({ where: { status: 'DESCHIS' } })
}

// Creează o raportare de sistem (reporterId = null) din detecția automată de fraudă, evitând
// duplicarea: dacă există deja o raportare automată DESCHISĂ pentru aceeași țintă, nu se mai creează.
export async function createSystemReport(
  targetType: ReportTarget,
  targetId: string,
  details: string
): Promise<boolean> {
  const existing = await prisma.report.findFirst({
    where: { targetType, targetId, reason: FRAUD_AUTO_REASON, status: 'DESCHIS' },
    select: { id: true },
  })
  if (existing) return false
  await prisma.report.create({
    data: { reporterId: null, targetType, targetId, reason: FRAUD_AUTO_REASON, details, status: 'DESCHIS' },
  })
  return true
}
