import { cookies } from 'next/headers'
import { getUserFromToken } from './auth'
import { COOKIE_NAME } from './constants'
import type { UserRole } from './types/roles'

export type SessionUser = {
  id: string
  firstName: string
  lastName: string
  role: UserRole
  email: string
  phone?: string
  avatar?: string
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const user = await getUserFromToken(token)
  if (!user) return null

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email,
    phone: user.phone ?? undefined,
    avatar: user.avatar ?? undefined,
  }
}
