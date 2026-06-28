// Autorizarea rutelor de cron (Vercel Cron). Când `CRON_SECRET` e setat, Vercel adaugă
// automat antetul `Authorization: Bearer <CRON_SECRET>` la invocările programate; verificăm
// asta ca o rută publică să nu poată fi declanșată de oricine.
// În dezvoltare (fără secret) permitem rularea manuală; în producție lipsa secretului → refuz.
import { NextResponse } from 'next/server'

export function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export function cronUnauthorized(): NextResponse {
  return NextResponse.json({ error: 'Neautorizat.' }, { status: 401 })
}
