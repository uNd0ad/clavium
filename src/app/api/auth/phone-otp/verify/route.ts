import { NextRequest, NextResponse } from 'next/server'
import { phoneOtpVerifySchema } from '@/lib/validations'
import { verifyPhoneOtpCode } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = phoneOtpVerifySchema.parse(body)
    await verifyPhoneOtpCode(data.phone, data.code)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
