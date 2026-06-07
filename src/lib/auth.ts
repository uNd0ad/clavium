import { compare, hash } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import {
  createUser,
  findUserByEmail,
  getUserById,
  invalidateOtp,
  storeOtpCode,
  getOtpCode,
  clearExpiredOtps,
} from './userStore'
import { JWT_SECRET } from './constants'
import type {
  AuthPayload,
  LoginRequest,
  OtpSendRequest,
  OtpVerifyRequest,
  RegisterRequest,
  User,
} from './types/auth'

const encoder = new TextEncoder()
const jwtKey = encoder.encode(JWT_SECRET)

export async function createToken(user: User) {
  return new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(jwtKey)
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtKey)
    return {
      userId: String(payload.userId),
      email: String(payload.email),
    }
  } catch {
    return null
  }
}

export async function registerUser(data: RegisterRequest) {
  const passwordHash = await hash(data.password, 10)
  return await createUser(data.name, data.email, passwordHash)
}

export async function loginUser(data: LoginRequest) {
  const user = await findUserByEmail(data.email)
  if (!user) {
    throw new Error('Email sau parolă incorectă.')
  }

  const isValid = await compare(data.password, user.passwordHash)
  if (!isValid) {
    throw new Error('Email sau parolă incorectă.')
  }

  return user
}

export async function sendOtpCode(data: OtpSendRequest) {
  await clearExpiredOtps()
  const code = String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6)
  await storeOtpCode(data.email, code)
  return code
}

export async function verifyOtpCode(data: OtpVerifyRequest) {
  await clearExpiredOtps()
  const entry = await getOtpCode(data.email)
  if (!entry || entry.code !== data.code) {
    throw new Error('Cod OTP invalid sau expirat.')
  }
  await invalidateOtp(data.email)
  const user = await findUserByEmail(data.email)
  if (user) return user
  const name = data.email.split('@')[0]
  return await createUser(name, data.email, await hash(Math.random().toString(36), 10))
}

export async function getUserFromToken(token: string) {
  const payload = await verifyToken(token)
  if (!payload) return null
  return await getUserById(payload.userId)
}
