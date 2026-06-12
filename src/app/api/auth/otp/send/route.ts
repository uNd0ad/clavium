import { NextRequest, NextResponse } from 'next/server'
import { otpSendSchema } from '@/lib/validations'
import { sendOtpCode } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = otpSendSchema.parse(body)
    const code = await sendOtpCode(data)
    // Nu există încă un serviciu de email — în dev codul se afișează în consola serverului.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Cod OTP pentru ${data.email}: ${code}`)
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
