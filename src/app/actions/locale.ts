'use server'

import { cookies } from 'next/headers'
import { LOCALE_COOKIE, isLocale } from '@/lib/i18n/config'

// Schimbă limba interfeței (cookie de un an). Clientul reîncarcă apoi ruta ca să re-randeze server-side.
export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return { ok: false as const, error: 'Limbă neacceptată.' }
  const store = await cookies()
  store.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return { ok: true as const }
}
