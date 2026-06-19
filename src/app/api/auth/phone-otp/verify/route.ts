import { NextRequest, NextResponse } from 'next/server'
import { phoneOtpVerifySchema } from '@/lib/validations'
import { verifyPhoneOtpCode } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'
import { rateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = phoneOtpVerifySchema.parse(body)

    if (!(await rateLimit(`phone-otp-verify:${data.phone}`, 5, 10 * 60 * 1000))) {
      return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    await verifyPhoneOtpCode(data.phone, data.code)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
