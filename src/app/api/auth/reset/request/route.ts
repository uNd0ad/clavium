import { NextRequest, NextResponse } from 'next/server'
import { otpSendSchema } from '@/lib/validations'
import { requestPasswordReset } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = otpSendSchema.parse(body)

    if (
      !rateLimit(`reset:${data.email.toLowerCase()}`, 3, 15 * 60 * 1000) ||
      !rateLimit(`reset-ip:${clientIp(request)}`, 10, 60 * 60 * 1000)
    ) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    await requestPasswordReset(data.email)
    // Răspuns identic indiferent dacă există contul.
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
