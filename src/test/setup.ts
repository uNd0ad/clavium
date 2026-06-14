import { vi } from 'vitest'
import type { SessionUser } from '@/lib/session'

// Utilizatorul „autentificat" controlat de teste (înlocuiește getCurrentUser).
const authState = vi.hoisted(() => ({ user: null as SessionUser | null }))

export function setUser(user: SessionUser | null) {
  authState.user = user
}

// Mock-uri pentru API-urile Next folosite de acțiuni (nu există context de request în teste).
vi.mock('@/lib/session', () => ({
  getCurrentUser: async () => authState.user,
}))
vi.mock('next/cache', () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}))
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}))
