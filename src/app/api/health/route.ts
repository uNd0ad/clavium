import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint de health check pentru load balancer / uptime monitoring.
// Verifică și conectivitatea la baza de date cu o interogare minimă.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', db: 'up', time: new Date().toISOString() })
  } catch {
    return NextResponse.json(
      { status: 'error', db: 'down', time: new Date().toISOString() },
      { status: 503 }
    )
  }
}
