import { NextRequest, NextResponse } from 'next/server'
import { phoneOtpSendSchema } from '@/lib/validations'
import { sendPhoneOtpCode } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = phoneOtpSendSchema.parse(body)

    // SMS-urile costă bani — limităm strict trimiterile.
    if (
      !rateLimit(`phone-otp-send:${data.phone}`, 3, 10 * 60 * 1000) ||
      !rateLimit(`phone-otp-send-ip:${clientIp(request)}`, 10, 60 * 60 * 1000)
    ) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    await sendPhoneOtpCode(data.phone)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
