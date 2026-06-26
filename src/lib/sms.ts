// Trimitere SMS prin SMSO.ro (https://api-docs.smso.ro/).
// Necesită în .env: SMS_API_URL, SMS_API_KEY și SMS_SENDER_ID (din GET /api/v1/senders).
// Fără aceste variabile, codul se afișează doar în consola serverului (mod dev).
// În producție, lipsa configurării aruncă imediat — altfel codul OTP nu ar ajunge
// niciodată la utilizator, fără nicio eroare (vezi PRODUCTION-READINESS.md, P0 #1).
import { logger } from './logger'

const SMSO_ERRORS: Record<number, string> = {
  400: 'Cerere invalidă către furnizorul SMS.',
  401: 'Cheia API pentru SMS este invalidă.',
  402: 'Credit SMS insuficient.',
  405: 'Numărul de telefon s-a dezabonat de la mesaje.',
  409: 'Prea multe SMS-uri trimise. Așteaptă un minut și încearcă din nou.',
}

function toE164(phone: string) {
  if (phone.startsWith('+')) return phone
  if (phone.startsWith('40')) return `+${phone}`
  if (phone.startsWith('0')) return `+4${phone}`
  return phone
}

export async function sendSms(phone: string, message: string): Promise<void> {
  const apiUrl = process.env.SMS_API_URL
  const apiKey = process.env.SMS_API_KEY
  const senderId = process.env.SMS_SENDER_ID

  if (!apiUrl || !apiKey || !senderId) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Furnizorul SMS nu este configurat (SMS_API_URL / SMS_API_KEY / SMS_SENDER_ID).')
    }
    console.log(`[DEV] SMS către ${phone}: ${message}`)
    return
  }

  const endpoint = `${apiUrl.replace(/\/$/, '')}/send`
  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Authorization': apiKey,
      },
      body: new URLSearchParams({
        to: toE164(phone),
        sender: senderId,
        body: message,
        type: 'otp',
      }),
      // Fără timeout, un furnizor blocat ar ține ocupată concurența serverless la nesfârșit.
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    logger.error('SMSO request failed', { error: (err as Error).message })
    throw new Error('Trimiterea SMS-ului a eșuat. Încearcă din nou.')
  }

  const result = await response.json().catch(() => null)
  const status = result?.status ?? response.status

  if (!response.ok || status !== 200) {
    logger.error('SMSO error', { httpStatus: response.status, result })
    throw new Error(SMSO_ERRORS[status] ?? 'Trimiterea SMS-ului a eșuat. Încearcă din nou.')
  }
}
