import type { UserRole } from './roles'

export type AccountType = 'PERSON' | 'COMPANY'

export type CompanyInput = {
  name: string
  cui: string
  reg: string
  address?: string
  vatPayer: boolean
}

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  passwordHash: string
  role: UserRole
  emailVerified: boolean
  kycStatus: string
  isActive: boolean
  avatar?: string | null
  accountType: AccountType
  companyName?: string | null
  companyCui?: string | null
  companyReg?: string | null
  companyAddress?: string | null
  companyVatPayer: boolean
  // Autentificare în doi pași (TOTP).
  totpEnabled: boolean
  totpSecret: string | null
  totpBackupCodes: string
  createdAt: string
  updatedAt: string
}

export type AuthPayload = {
  userId: string
  email: string
  sessionId?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  accountType?: AccountType
  firstName: string
  lastName: string
  email: string
  password: string
  role?: UserRole
  phone?: string
  companyName?: string
  companyCui?: string
  companyReg?: string
  companyAddress?: string
  companyVatPayer?: boolean
  referralCode?: string
}

export type OtpSendRequest = {
  email: string
}

export type OtpVerifyRequest = {
  email: string
  code: string
}
