import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/apiAuth'
import { profileUpdateSchema } from '@/lib/validations'
import { errorMessage } from '@/lib/apiError'
import { revokeAllSessions } from '@/lib/auth'
import { normalizePhone } from '@/lib/userStore'
import { COOKIE_NAME } from '@/lib/constants'

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    const body = await request.json()
    const data = profileUpdateSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.firstName ? { firstName: data.firstName } : {}),
        ...(data.lastName ? { lastName: data.lastName } : {}),
        // Numărul nou trebuie re-verificat prin OTP înainte de a fi considerat de încredere.
        ...(data.phone ? { phone: normalizePhone(data.phone), phoneVerified: false } : {}),
      },
    })

    return NextResponse.json({
      user: { firstName: updated.firstName, lastName: updated.lastName, phone: updated.phone },
    })
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}

// Dezactivarea contului (soft delete): contul nu mai poate fi folosit, datele rămân pentru contracte.
export async function DELETE() {
  const { user, error } = await requireUser()
  if (error) return error

  try {
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } })
    await revokeAllSessions(user.id)

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
    return response
  } catch (err) {
    return NextResponse.json({ error: errorMessage(err) }, { status: 400 })
  }
}
