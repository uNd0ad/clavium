// Sarcini programate (rulate din rutele /api/cron/*). Funcții pure de business, separate de
// rutele HTTP ca să fie testabile. Toate sunt idempotente: o rulare repetată nu strică nimic.
import { prisma } from './prisma'
import { notify } from './notify'
import { sendEmail } from './email'
import { logger } from './logger'

const DAY_MS = 86_400_000
// Cu câte zile înainte de scadență trimitem prima notificare.
const REMINDER_LEAD_DAYS = 3
// La cât timp re-notificăm o chirie restantă (ca să nu trimitem zilnic).
const OVERDUE_REPEAT_DAYS = 3

const ronFmt = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON', maximumFractionDigits: 0 })

function daysOverdue(due: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - due.getTime()) / DAY_MS))
}

// Curăță jetoanele și sesiunile expirate/consumate — igienă a bazei de date și a suprafeței de atac.
export async function cleanupExpiredTokens(now: Date = new Date()) {
  const [otp, phoneOtp, emailTokens, sessions] = await prisma.$transaction([
    prisma.otp.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.phoneOtp.deleteMany({ where: { expiresAt: { lt: now } } }),
    // Jetoane de email expirate sau deja folosite (verificare / resetare parolă).
    prisma.emailToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }] } }),
    // Sesiuni expirate sau revocate (logout / „deconectează acest dispozitiv").
    prisma.session.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { revokedAt: { not: null } }] } }),
  ])
  return {
    otp: otp.count,
    phoneOtp: phoneOtp.count,
    emailTokens: emailTokens.count,
    sessions: sessions.count,
  }
}

// Dunning: notificări de chirie apropiată de scadență și de chirie restantă. Idempotent prin
// `lastReminderAt` — chiriile viitoare se notifică o singură dată, cele restante cel mult o dată
// la `OVERDUE_REPEAT_DAYS`. Emailul e best-effort (un eșec nu blochează restul lotului).
export async function processDunning(now: Date = new Date()) {
  const soon = new Date(now.getTime() + REMINDER_LEAD_DAYS * DAY_MS)
  const repeatCutoff = new Date(now.getTime() - OVERDUE_REPEAT_DAYS * DAY_MS)

  const include = { contract: { include: { property: true } }, user: true } as const

  const [upcoming, overdue] = await Promise.all([
    prisma.payment.findMany({
      where: { type: 'CHIRIE', status: 'IN_CURS', dueDate: { gte: now, lte: soon }, lastReminderAt: null },
      include,
    }),
    prisma.payment.findMany({
      where: {
        type: 'CHIRIE',
        status: 'IN_CURS',
        dueDate: { lt: now },
        OR: [{ lastReminderAt: null }, { lastReminderAt: { lt: repeatCutoff } }],
      },
      include,
    }),
  ])

  let remindersSent = 0
  let overdueSent = 0

  for (const payment of upcoming) {
    if (!payment.contract || !payment.dueDate) continue
    const title = contractTitle(payment.contract.property?.title)
    try {
      await notify(
        payment.userId,
        'Chiria se apropie de scadență',
        `Chiria de ${ronFmt.format(payment.amount)} pentru „${title}” este scadentă pe ${formatDay(payment.dueDate)}.`,
        'warning'
      )
      await sendEmailSafe(
        payment.user.email,
        'Reamintire: chiria se apropie de scadență',
        `Bună, ${payment.user.firstName},\n\nChiria de ${ronFmt.format(payment.amount)} pentru „${title}” este scadentă pe ${formatDay(payment.dueDate)}.\nPoți plăti din contul tău Vatrio.`
      )
      await prisma.payment.update({ where: { id: payment.id }, data: { lastReminderAt: now } })
      remindersSent += 1
    } catch (err) {
      logger.error('dunning: reminder eșuat', { paymentId: payment.id, error: (err as Error).message })
    }
  }

  for (const payment of overdue) {
    if (!payment.contract || !payment.dueDate) continue
    const title = contractTitle(payment.contract.property?.title)
    const days = daysOverdue(payment.dueDate, now)
    try {
      await notify(
        payment.userId,
        'Chirie restantă',
        `Chiria de ${ronFmt.format(payment.amount)} pentru „${title}” este restantă de ${days} ${days === 1 ? 'zi' : 'zile'}. Te rugăm să o achiți cât mai curând.`,
        'danger'
      )
      // Proprietarul e informat și el că plata întârzie.
      await notify(
        payment.contract.ownerId,
        'Chirie întârziată',
        `Chiria de ${ronFmt.format(payment.amount)} pentru „${title}” întârzie de ${days} ${days === 1 ? 'zi' : 'zile'}.`,
        'warning'
      )
      await sendEmailSafe(
        payment.user.email,
        'Chirie restantă',
        `Bună, ${payment.user.firstName},\n\nChiria de ${ronFmt.format(payment.amount)} pentru „${title}” este restantă de ${days} zile. Te rugăm să o achiți din contul tău Vatrio pentru a evita penalitățile prevăzute în contract.`
      )
      await prisma.payment.update({ where: { id: payment.id }, data: { lastReminderAt: now } })
      overdueSent += 1
    } catch (err) {
      logger.error('dunning: notificare restanță eșuată', { paymentId: payment.id, error: (err as Error).message })
    }
  }

  return { remindersSent, overdueSent }
}

function contractTitle(title?: string | null): string {
  return title ?? 'imobil'
}

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

async function sendEmailSafe(to: string, subject: string, body: string): Promise<void> {
  try {
    await sendEmail(to, subject, body)
  } catch (err) {
    logger.warn('dunning: email eșuat', { to, error: (err as Error).message })
  }
}
