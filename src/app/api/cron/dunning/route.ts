import { NextResponse } from 'next/server'
import { authorizeCron, cronUnauthorized } from '@/lib/cron'
import { processDunning } from '@/lib/jobs'
import { processAutopay } from '@/lib/autopay'
import { processSavedSearchAlerts } from '@/lib/savedSearches'
import { logger } from '@/lib/logger'
import { errorMessage } from '@/lib/apiError'

// Cron zilnic: întâi încasează automat chiriile scadente (autopay), apoi trimite reamintiri/restanțe
// pentru ce a rămas neplătit (dunning). Ordinea contează: o chirie încasată automat nu mai e dunată.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!authorizeCron(req)) return cronUnauthorized()
  try {
    const autopay = await processAutopay()
    const result = await processDunning()
    const alerts = await processSavedSearchAlerts()
    logger.info('cron: autopay + dunning + alerte', { ...autopay, ...result, ...alerts })
    return NextResponse.json({
      ok: true,
      autopayCharged: autopay.charged,
      autopaySkipped: autopay.skipped,
      ...result,
      searchAlerts: alerts.alerted,
    })
  } catch (err) {
    logger.error('cron: dunning a eșuat', { error: errorMessage(err) })
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
