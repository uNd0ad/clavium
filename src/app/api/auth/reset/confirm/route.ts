import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resetPassword } from '@/lib/auth'
import { errorMessage } from '@/lib/apiError'
import { passwordSchema } from '@/lib/validations'

const resetConfirmSchema = z.object({
  token: z.string().min(10, 'Token invalid.'),
  password: passwordSchema,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = resetConfirmSchema.parse(body)
    await resetPassword(data.token, data.password)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 })
  }
}
