import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { authorizeCron, cronUnauthorized } from '@/lib/cron'
import { cleanupExpiredTokens, purgeKycBiometrics } from '@/lib/jobs'
import { captureException, logger } from '@/lib/logger'
import { errorMessage } from '@/lib/apiError'

// Cron zilnic: șterge jetoanele OTP/email și sesiunile expirate/revocate și purjează imaginile
// biometrice KYC ieșite din fereastra de retenție (minimizarea datelor, GDPR).
export const runtime = 'nodejs'
// Niciodată din cache — e o sarcină cu efecte.
export const dynamic = 'force-dynamic'

const monitorConfig = {
  schedule: { type: 'crontab' as const, value: '0 3 * * *' },
  timezone: 'UTC',
  checkinMargin: 10,
  maxRuntime: 30,
  failureIssueThreshold: 1,
  recoveryThreshold: 1,
  isolateTrace: true,
}

export async function GET(req: Request): Promise<NextResponse> {
  if (!authorizeCron(req)) return cronUnauthorized()
  try {
    return await Sentry.withMonitor(
      'clavium-cleanup',
      async () => {
        const tokens = await cleanupExpiredTokens()
        const kyc = await purgeKycBiometrics()
        logger.info('cron: cleanup jetoane/sesiuni + purjare KYC', { ...tokens, ...kyc })
        return NextResponse.json({ ok: true, ...tokens, kycPurged: kyc.purged, kycFilesDeleted: kyc.filesDeleted })
      },
      monitorConfig,
    )
  } catch (err) {
    captureException(err, { op: 'cron.cleanup' })
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
