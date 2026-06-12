import { NextRequest, NextResponse } from 'next/server'
import { phoneOtpSendSchema } from '@/lib/validations'
import { sendPhoneOtpCode } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = phoneOtpSendSchema.parse(body)
    await sendPhoneOtpCode(data.phone)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
