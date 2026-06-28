'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { recordAuditSafe } from '@/lib/audit'
import { REPORT_REASONS, REPORT_TARGETS, type ReportReason, type ReportTarget } from '@/lib/reports'

const MAX_DETAILS = 1000

// Sesizează o listare sau un utilizator (abuz/fraudă). Orice utilizator autentificat poate raporta;
// o raportare deschisă per autor+țintă (idempotent). Adminii sunt notificați.
export async function reportAction(targetType: string, targetId: string, reason: string, details?: string) {
  try {
    const user = await requireActionUser()
    if (!REPORT_TARGETS.includes(targetType as ReportTarget)) return { ok: false as const, error: 'Țintă invalidă.' }
    if (!REPORT_REASONS.includes(reason as ReportReason)) return { ok: false as const, error: 'Motiv invalid.' }
    const text = (details ?? '').trim()
    if (text.length > MAX_DETAILS) return { ok: false as const, error: 'Descrierea este prea lungă.' }

    // Ținta trebuie să existe; un utilizator nu se poate raporta pe sine.
    if (targetType === 'PROPERTY') {
      const property = await prisma.property.findUnique({ where: { id: targetId }, select: { id: true } })
      if (!property) return { ok: false as const, error: 'Listarea nu există.' }
    } else {
      if (targetId === user.id) return { ok: false as const, error: 'Nu te poți raporta pe tine.' }
      const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } })
      if (!target) return { ok: false as const, error: 'Utilizatorul nu există.' }
    }

    // Idempotent: o singură raportare deschisă per autor + țintă.
    const existing = await prisma.report.findFirst({
      where: { reporterId: user.id, targetType, targetId, status: 'DESCHIS' },
      select: { id: true },
    })
    if (existing) return { ok: true as const, alreadyReported: true }

    await prisma.report.create({
      data: { reporterId: user.id, targetType, targetId, reason, details: text || null, status: 'DESCHIS' },
    })

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } })
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          title: 'Sesizare nouă',
          description: `O ${targetType === 'PROPERTY' ? 'listare' : 'persoană'} a fost raportată (${reason}).`,
          variant: 'warning',
        })),
      })
    }
    return { ok: true as const, alreadyReported: false }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Rezolvarea unei raportări de către un admin: REZOLVAT (acțiune luată) sau RESPINS (fals pozitiv).
export async function resolveReportAction(reportId: string, decision: 'REZOLVAT' | 'RESPINS') {
  try {
    const admin = await requireActionUser(['ADMIN'])
    if (decision !== 'REZOLVAT' && decision !== 'RESPINS') return { ok: false as const, error: 'Decizie invalidă.' }
    const report = await prisma.report.findUnique({ where: { id: reportId } })
    if (!report) return { ok: false as const, error: 'Sesizarea nu există.' }
    if (report.status !== 'DESCHIS') return { ok: false as const, error: 'Sesizarea este deja rezolvată.' }

    await prisma.report.update({
      where: { id: reportId },
      data: { status: decision, resolvedById: admin.id, resolvedAt: new Date() },
    })
    await recordAuditSafe({
      actorId: admin.id,
      action: 'REPORT_RESOLVED',
      entityType: report.targetType === 'PROPERTY' ? 'PROPERTY' : 'USER',
      entityId: report.targetId,
      metadata: { reportId, decision, reason: report.reason },
    })
    revalidatePath('/dashboard/admin/raportari')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
