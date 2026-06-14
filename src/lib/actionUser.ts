import { getCurrentUser, type SessionUser } from './session'
import type { UserRole } from './types/roles'

// Echivalentul lui requireUser pentru Server Actions: aruncă în loc să întoarcă un răspuns HTTP.
export async function requireActionUser(roles?: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Neautentificat.')
  if (roles && !roles.includes(user.role)) throw new Error('Nu ai permisiunea necesară.')
  return user
}
