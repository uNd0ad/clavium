import { NextResponse } from 'next/server'
import { authorizeCron, cronUnauthorized } from '@/lib/cron'
import { cleanupExpiredTokens, purgeKycBiometrics } from '@/lib/jobs'
import { logger } from '@/lib/logger'
import { errorMessage } from '@/lib/apiError'

// Cron zilnic: șterge jetoanele OTP/email și sesiunile expirate/revocate și purjează imaginile
// biometrice KYC ieșite din fereastra de retenție (minimizarea datelor, GDPR).
export const runtime = 'nodejs'
// Niciodată din cache — e o sarcină cu efecte.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!authorizeCron(req)) return cronUnauthorized()
  try {
    const tokens = await cleanupExpiredTokens()
    const kyc = await purgeKycBiometrics()
    logger.info('cron: cleanup jetoane/sesiuni + purjare KYC', { ...tokens, ...kyc })
    return NextResponse.json({ ok: true, ...tokens, kycPurged: kyc.purged, kycFilesDeleted: kyc.filesDeleted })
  } catch (err) {
    logger.error('cron: cleanup a eșuat', { error: errorMessage(err) })
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
