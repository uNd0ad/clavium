import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { authorizeCron, cronUnauthorized } from '@/lib/cron'
import { processDunning } from '@/lib/jobs'
import { processAutopay } from '@/lib/autopay'
import { processSavedSearchAlerts } from '@/lib/savedSearches'
import { captureException, logger } from '@/lib/logger'
import { errorMessage } from '@/lib/apiError'

// Cron zilnic: întâi încasează automat chiriile scadente (autopay), apoi trimite reamintiri/restanțe
// pentru ce a rămas neplătit (dunning). Ordinea contează: o chirie încasată automat nu mai e dunată.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const monitorConfig = {
  schedule: { type: 'crontab' as const, value: '0 9 * * *' },
  timezone: 'UTC',
  checkinMargin: 10,
  maxRuntime: 60,
  failureIssueThreshold: 1,
  recoveryThreshold: 1,
  isolateTrace: true,
}

export async function GET(req: Request): Promise<NextResponse> {
  if (!authorizeCron(req)) return cronUnauthorized()
  try {
    return await Sentry.withMonitor(
      'vatrio-dunning',
      async () => {
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
      },
      monitorConfig,
    )
  } catch (err) {
    captureException(err, { op: 'cron.dunning' })
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
