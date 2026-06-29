// Plata automată a chiriei (opt-in al chiriașului). La scadență, chiria contractelor cu autopay
// activ se încasează automat. În mod dev (fără Stripe) plata se decontează direct; cu Stripe activ
// ar urma o încasare off-session pe cardul salvat (scaffold env-gated mai jos). Rulează din cron-ul
// de dunning, înaintea notificărilor, ca o chirie încasată automat să nu mai genereze reamintiri.
import { prisma } from './prisma'
import { notify } from './notify'
import { settlePayment } from './paymentSettle'
import { STRIPE_ENABLED } from './stripe'
import { formatRon } from './dashboardData'
import { logger } from './logger'

export async function processAutopay(now: Date = new Date()) {
  const due = await prisma.payment.findMany({
    where: {
      type: 'CHIRIE',
      status: 'IN_CURS',
      dueDate: { lte: now },
      contract: { autopayEnabled: true, status: 'ACTIV' },
    },
    include: { contract: { include: { property: true } }, user: true },
  })

  let charged = 0
  let skipped = 0
  for (const payment of due) {
    try {
      if (STRIPE_ENABLED) {
        // Stripe activ: aici se creează un PaymentIntent off-session pe PaymentMethod-ul salvat al
        // chiriașului (SetupIntent la prima plată + Customer Stripe), iar webhook-ul va apela
        // settlePayment. Până la conectarea cardurilor salvate, sărim — chiriașul primește dunning.
        logger.info('autopay: Stripe activ, încasare off-session neconectată — se sare', { paymentId: payment.id })
        skipped += 1
        continue
      }
      // Mod dev: decontăm direct (echivalent confirmării instantanee a plății). Idempotent.
      await settlePayment(payment.id)
      const title = payment.contract?.property?.title ?? 'imobil'
      await notify(payment.userId, 'Chirie plătită automat', `Chiria de ${formatRon(payment.amount)} pentru „${title}” a fost încasată automat.`, 'success')
      if (payment.contract) {
        await notify(payment.contract.ownerId, 'Chirie încasată', `Chiria de ${formatRon(payment.amount)} pentru „${title}” a fost încasată automat de la chiriaș.`, 'info')
      }
      charged += 1
    } catch (err) {
      logger.error('autopay: încasare eșuată', { paymentId: payment.id, error: (err as Error).message })
    }
  }
  return { charged, skipped }
}
