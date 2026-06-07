import type { UserRole } from './roles'

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  passwordHash: string
  role: UserRole
  emailVerified: boolean
  isActive: boolean
  avatar?: string | null
  createdAt: string
  updatedAt: string
}

export type AuthPayload = {
  userId: string
  email: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: UserRole
}

export type OtpSendRequest = {
  email: string
}

export type OtpVerifyRequest = {
  email: string
  code: string
}
