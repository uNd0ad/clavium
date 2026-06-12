import { NextRequest, NextResponse } from 'next/server'
import { otpSendSchema } from '@/lib/validations'
import { sendOtpCode } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = otpSendSchema.parse(body)

    if (
      !rateLimit(`otp-send:${data.email.toLowerCase()}`, 3, 10 * 60 * 1000) ||
      !rateLimit(`otp-send-ip:${clientIp(request)}`, 10, 60 * 60 * 1000)
    ) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    // Răspuns identic indiferent dacă există contul, ca să nu divulgăm emailurile.
    await sendOtpCode(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
