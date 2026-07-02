import { cache } from 'react'
import { cookies } from 'next/headers'
import { getUserFromToken, verifyToken } from './auth'
import { COOKIE_NAME } from './constants'
import type { UserRole } from './types/roles'
import type { AccountType } from './types/auth'

export type SessionUser = {
  id: string
  firstName: string
  lastName: string
  role: UserRole
  email: string
  emailVerified: boolean
  kycStatus: string
  phone?: string
  avatar?: string
  accountType: AccountType
  companyName?: string
  companyCui?: string
  companyReg?: string
  companyAddress?: string
  companyVatPayer: boolean
}

// `cache()` (React) memoizează pe durata unui singur request: mai multe apeluri (layout dashboard +
// pagină + Navbar server) → o singură interogare DB. Cookie-urile sunt stabile în cadrul request-ului.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
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
    emailVerified: user.emailVerified,
    kycStatus: user.kycStatus,
    phone: user.phone ?? undefined,
    avatar: user.avatar ?? undefined,
    accountType: user.accountType,
    companyName: user.companyName ?? undefined,
    companyCui: user.companyCui ?? undefined,
    companyReg: user.companyReg ?? undefined,
    companyAddress: user.companyAddress ?? undefined,
    companyVatPayer: user.companyVatPayer,
  }
})

// Forma minimă de care are nevoie Navbar-ul, rezolvată pe server ca să afișeze starea de autentificare
// din primul render (fără fetch client-side, fără „flash" de utilizator delogat). `undefined` nu apare
// niciodată aici — Navbar-ul distinge „server a decis: nimeni" (null) de „nu am primit prop" (undefined).
export type NavUser = { firstName: string; lastName: string; email: string }

export async function getNavUser(): Promise<NavUser | null> {
  const user = await getCurrentUser()
  return user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null
}

// Id-ul sesiunii curente (din JWT-ul de pe cookie). Folosit pentru a marca „acest dispozitiv"
// în lista de sesiuni și pentru a-l exclude la revocarea celorlalte.
export async function getCurrentSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.sessionId ?? null
}
