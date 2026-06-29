// Managementul sesiunilor/dispozitivelor: listarea sesiunilor active, revocarea lor și alerta
// la autentificarea de pe un dispozitiv nou. Sesiunile sunt rândurile din `Session` (vezi auth.ts).
import { prisma } from './prisma'
import { notify } from './notify'
import { sendEmail } from './email'
import { logger } from './logger'
import type { DeviceMeta } from './auth'

// Etichetă lizibilă din User-Agent (browser + sistem de operare). Aproximativă, suficientă pentru
// recunoașterea dispozitivului în listă; ordinea testelor contează (ex. Edge înainte de Chrome).
export function deviceLabel(userAgent: string | null | undefined): string {
  if (!userAgent) return 'Dispozitiv necunoscut'
  const os = /Windows/i.test(userAgent)
    ? 'Windows'
    : /iPhone/i.test(userAgent)
      ? 'iPhone'
      : /iPad/i.test(userAgent)
        ? 'iPad'
        : /Macintosh|Mac OS X/i.test(userAgent)
          ? 'macOS'
          : /Android/i.test(userAgent)
            ? 'Android'
            : /Linux/i.test(userAgent)
              ? 'Linux'
              : 'sistem necunoscut'
  const browser = /Edg\//i.test(userAgent)
    ? 'Edge'
    : /OPR\/|Opera/i.test(userAgent)
      ? 'Opera'
      : /Firefox\//i.test(userAgent)
        ? 'Firefox'
        : /Chrome\//i.test(userAgent)
          ? 'Chrome'
          : /Safari\//i.test(userAgent)
            ? 'Safari'
            : 'browser'
  return `${browser} pe ${os}`
}

export type SessionInfo = {
  id: string
  label: string
  ip: string | null
  lastSeenAt: Date
  createdAt: Date
  isCurrent: boolean
}

// Sesiunile active (nerevocate, neexpirate) ale unui utilizator, cea curentă marcată.
export async function getUserSessions(userId: string, currentSessionId: string | null): Promise<SessionInfo[]> {
  const sessions = await prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })
  return sessions.map((s) => ({
    id: s.id,
    label: deviceLabel(s.userAgent),
    ip: s.ip,
    lastSeenAt: s.lastSeenAt ?? s.createdAt,
    createdAt: s.createdAt,
    isCurrent: s.id === currentSessionId,
  }))
}

// Revocă o sesiune anume a utilizatorului. Întoarce true dacă a fost una de revocat (idempotent).
export async function revokeUserSession(userId: string, sessionId: string): Promise<boolean> {
  const res = await prisma.session.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return res.count > 0
}

// Revocă toate celelalte sesiuni active ale utilizatorului, păstrând-o pe cea curentă.
export async function revokeOtherSessions(userId: string, keepSessionId: string): Promise<number> {
  const res = await prisma.session.updateMany({
    where: { userId, revokedAt: null, NOT: { id: keepSessionId } },
    data: { revokedAt: new Date() },
  })
  return res.count
}

// Alertă la autentificarea de pe un dispozitiv nou (notificare în aplicație + email best-effort).
export async function notifyNewDevice(
  user: { id: string; firstName: string; email: string },
  meta: DeviceMeta
): Promise<void> {
  const label = deviceLabel(meta.userAgent ?? null)
  const where = `${label}${meta.ip ? ` (IP ${meta.ip})` : ''}`
  await notify(
    user.id,
    'Autentificare de pe un dispozitiv nou',
    `Am detectat o autentificare de pe ${where}. Dacă nu ai fost tu, schimbă-ți parola și revocă sesiunea din Setări.`,
    'warning'
  )
  try {
    await sendEmail(
      user.email,
      'Autentificare de pe un dispozitiv nou — Clavium',
      `Bună, ${user.firstName},\n\nAm detectat o autentificare nouă în contul tău Clavium de pe ${where}.\n\nDacă ai fost tu, poți ignora acest mesaj. Dacă nu, schimbă-ți parola imediat și revocă sesiunile active din Profil → Sesiuni active.`
    )
  } catch (err) {
    logger.warn('alertă dispozitiv nou: email eșuat', { userId: user.id, error: (err as Error).message })
  }
}
