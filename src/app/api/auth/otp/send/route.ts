import { NextRequest, NextResponse } from 'next/server'
import { otpSendSchema } from '@/lib/validations'
import { sendOtpCode } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = otpSendSchema.parse(body)
    await sendOtpCode(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
