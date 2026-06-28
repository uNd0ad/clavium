import { NextResponse } from 'next/server'
import { authorizeCron, cronUnauthorized } from '@/lib/cron'
import { processDunning } from '@/lib/jobs'
import { logger } from '@/lib/logger'
import { errorMessage } from '@/lib/apiError'

// Cron zilnic: notificări de chirie apropiată de scadență + chirie restantă (dunning).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!authorizeCron(req)) return cronUnauthorized()
  try {
    const result = await processDunning()
    logger.info('cron: dunning', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    logger.error('cron: dunning a eșuat', { error: errorMessage(err) })
    return NextResponse.json({ error: errorMessage(err) }, { status: 500 })
  }
}
