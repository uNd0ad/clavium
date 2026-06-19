import { headers } from 'next/headers'
import { APP_URL } from './constants'

// Originea reală a cererii (protocol + host), derivată din anteturi.
// Necesară pentru ca redirect-urile Stripe (success_url / cancel_url) să se întoarcă pe gazda
// pe care a folosit-o efectiv utilizatorul — inclusiv IP-ul din LAN când testezi de pe telefon,
// nu doar localhost. În producție (Vercel) x-forwarded-host/proto dau domeniul real cu https.
// Fallback pe APP_URL dacă anteturile lipsesc.
export async function requestBaseUrl(): Promise<string> {
  try {
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (!host) return APP_URL
    const proto = h.get('x-forwarded-proto') ?? 'http'
    return `${proto}://${host}`
  } catch {
    return APP_URL
  }
}
