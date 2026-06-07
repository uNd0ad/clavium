export type User = {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: string
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
  name: string
  email: string
  password: string
}

export type OtpSendRequest = {
  email: string
}

export type OtpVerifyRequest = {
  email: string
  code: string
}
