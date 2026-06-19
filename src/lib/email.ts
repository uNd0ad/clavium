// Trimitere email — furnizorul real (Resend/SendGrid/SES) se conectează aici.
// Config prin EMAIL_API_URL + EMAIL_API_KEY; fără ele (sau cu placeholder),
// mesajul se afișează în consola serverului (mod dev). În producție, lipsa
// configurării aruncă imediat — altfel emailurile (reset parolă, verificare) ar
// eșua silențios și ar bloca utilizatorii (vezi PRODUCTION-READINESS.md, P0 #1).
export async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const apiUrl = process.env.EMAIL_API_URL
  const apiKey = process.env.EMAIL_API_KEY

  if (!apiUrl || !apiKey || apiKey.includes('your_')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Furnizorul de email nu este configurat (EMAIL_API_URL / EMAIL_API_KEY).')
    }
    console.log(`[DEV] Email către ${to} — ${subject}\n${body}`)
    return
  }

  // TODO: ajustează payload-ul la formatul furnizorului de email ales.
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ to, subject, text: body }),
  })
  if (!response.ok) {
    throw new Error('Trimiterea emailului a eșuat. Încearcă din nou.')
  }
}
