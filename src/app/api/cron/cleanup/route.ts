import { NextResponse } from 'next/server'
import { authorizeCron, cronUnauthorized } from '@/lib/cron'
import { cleanupExpiredTokens } from '@/lib/jobs'
import { logger } from '@/lib/logger'
import { errorMessage } from '@/lib/apiError'

// Cron zilnic: șterge jetoanele OTP/email și sesiunile expirate sau revocate.
export const runtime = 'nodejs'
// Niciodată din cache — e o sarcină cu efecte.
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!authorizeCron(req)) return cronUnauthorized()
  try {
    const result = await cleanupExpiredTokens()
    logger.info('cron: cleanup jetoane/sesiuni', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    logger.error('cron: cleanup a eșuat', { error: errorMessage(err) })
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
