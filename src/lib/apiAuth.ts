import { NextResponse } from 'next/server'
import { getCurrentUser, type SessionUser } from './session'
import type { UserRole } from './types/roles'

type GuardResult = { user: SessionUser; error: null } | { user: null; error: NextResponse }

export async function requireUser(roles?: UserRole[]): Promise<GuardResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Neautentificat.' }, { status: 401 }) }
  }
  if (roles && !roles.includes(user.role)) {
    return { user: null, error: NextResponse.json({ error: 'Nu ai permisiunea necesară.' }, { status: 403 }) }
  }
  return { user, error: null }
}
