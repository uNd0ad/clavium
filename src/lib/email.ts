// Trimitere email prin SMTP (nodemailer). Config prin SMTP_HOST / SMTP_PORT / SMTP_USER /
// SMTP_PASS (+ opțional SMTP_FROM, SMTP_SECURE). Fără SMTP_HOST, în dev mesajul se afișează
// în consola serverului; în producție lipsa configurării aruncă imediat — altfel emailurile
// (reset parolă, verificare) ar eșua silențios și ar bloca utilizatorii (PRODUCTION-READINESS.md, P0 #1).
import type { Transporter } from 'nodemailer'

// Transporter creat o singură dată (pool de conexiuni), reutilizat între cereri.
let transporter: Transporter | null = null

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter
  const { createTransport } = await import('nodemailer')
  const port = Number(process.env.SMTP_PORT) || 587
  transporter = createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 = TLS implicit; 587/25 = STARTTLS. Suprascrie cu SMTP_SECURE=true dacă e nevoie.
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  })
  return transporter
}

export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP neconfigurat (SMTP_HOST / SMTP_USER / SMTP_PASS).')
    }
    console.log(`[DEV] Email către ${to} — ${subject}\n${body}`)
    return
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@clavium.ro'
  const tx = await getTransporter()
  await tx.sendMail({ from, to, subject, text: body })
}
