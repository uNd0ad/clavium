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
  storePhoneOtp,
  verifyPhoneOtp,
  isPhoneVerified,
  consumePhoneOtp,
  normalizePhone,
} from './userStore'
import { prisma } from './prisma'
import { sendSms } from './sms'
import { sendEmail } from './email'
import { sha256, randomToken } from './hash'
import { JWT_SECRET, APP_URL } from './constants'
import { captureException } from './logger'
import { recordTermsConsent } from './terms'
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

const SESSION_HOURS = 2

export async function createToken(user: User) {
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * SESSION_HOURS),
    },
  })

  return new SignJWT({ userId: user.id, email: user.email, sid: session.id })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(jwtKey)
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtKey)
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      sessionId: payload.sid ? String(payload.sid) : undefined,
    }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const payload = await verifyToken(token)
  if (!payload) return null

  // Sesiunea din DB permite revocarea token-urilor încă valide criptografic.
  if (payload.sessionId) {
    const session = await prisma.session.findUnique({ where: { id: payload.sessionId } })
    if (!session || session.revokedAt || session.expiresAt < new Date()) return null
  }

  const user = await getUserById(payload.userId)
  if (!user || !user.isActive) return null
  return user
}

export async function revokeSessionFromToken(token: string) {
  const payload = await verifyToken(token)
  if (!payload?.sessionId) return
  await prisma.session.updateMany({
    where: { id: payload.sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function revokeAllSessions(userId: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function registerUser(data: RegisterRequest) {
  if (data.phone) {
    const verified = await isPhoneVerified(data.phone)
    if (!verified) {
      throw new Error('Numărul de telefon nu a fost verificat prin OTP.')
    }
  }
  const passwordHash = await hash(data.password, 10)
  const company =
    data.accountType === 'COMPANY'
      ? {
          name: data.companyName ?? '',
          cui: data.companyCui ?? '',
          reg: data.companyReg ?? '',
          address: data.companyAddress,
          vatPayer: Boolean(data.companyVatPayer),
        }
      : undefined
  const user = await createUser(
    data.firstName,
    data.lastName,
    data.email,
    passwordHash,
    data.role,
    data.phone ? normalizePhone(data.phone) : undefined,
    company
  )
  if (data.phone) {
    await consumePhoneOtp(data.phone)
  }
  // Acceptarea T&C la înregistrare (formularul de signup conține bifa obligatorie).
  await recordTermsConsent(user.id)
  try {
    await sendVerificationEmail(user)
  } catch (error) {
    captureException(error, { op: 'sendVerificationEmail', userId: user.id })
  }
  return user
}

export async function sendVerificationEmail(user: User) {
  const token = randomToken()
  await prisma.emailToken.create({
    data: {
      userId: user.id,
      token: sha256(token),
      type: 'VERIFY_EMAIL',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  })
  await sendEmail(
    user.email,
    'Confirmă adresa de email — Clavium',
    `Salut, ${user.firstName}!\n\nConfirmă adresa de email accesând linkul:\n${APP_URL}/api/auth/verify-email/confirm?token=${token}\n\nLinkul expiră în 24 de ore.`
  )
}

export async function confirmEmailToken(token: string) {
  const entry = await prisma.emailToken.findUnique({ where: { token: sha256(token) } })
  if (!entry || entry.type !== 'VERIFY_EMAIL' || entry.usedAt || entry.expiresAt < new Date()) {
    throw new Error('Link de verificare invalid sau expirat.')
  }
  await prisma.$transaction([
    prisma.emailToken.update({ where: { id: entry.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: entry.userId }, data: { emailVerified: true } }),
  ])
}

export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email)
  // Răspuns identic indiferent dacă emailul există, ca să nu divulgăm conturile.
  if (!user) return
  const token = randomToken()
  await prisma.emailToken.create({
    data: {
      userId: user.id,
      token: sha256(token),
      type: 'RESET_PASSWORD',
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  })
  await sendEmail(
    user.email,
    'Resetare parolă — Clavium',
    `Salut, ${user.firstName}!\n\nResetează parola accesând linkul:\n${APP_URL}/auth/reset-parola?token=${token}\n\nLinkul expiră în 30 de minute. Dacă nu ai cerut resetarea, ignoră acest mesaj.`
  )
}

export async function resetPassword(token: string, newPassword: string) {
  const entry = await prisma.emailToken.findUnique({ where: { token: sha256(token) } })
  if (!entry || entry.type !== 'RESET_PASSWORD' || entry.usedAt || entry.expiresAt < new Date()) {
    throw new Error('Link de resetare invalid sau expirat.')
  }
  const passwordHash = await hash(newPassword, 10)
  await prisma.$transaction([
    prisma.emailToken.update({ where: { id: entry.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: entry.userId }, data: { passwordHash } }),
  ])
  await revokeAllSessions(entry.userId)
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await getUserById(userId)
  if (!user) throw new Error('Utilizator inexistent.')
  const valid = await compare(currentPassword, user.passwordHash)
  if (!valid) throw new Error('Parola actuală este incorectă.')
  const passwordHash = await hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  await revokeAllSessions(userId)
}

export async function sendPhoneOtpCode(phone: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  await storePhoneOtp(phone, code)
  await sendSms(phone, `Codul tău de verificare Clavium este: ${code}`)
  return code
}

export async function verifyPhoneOtpCode(phone: string, code: string) {
  const valid = await verifyPhoneOtp(phone, code)
  if (!valid) {
    throw new Error('Cod OTP invalid sau expirat.')
  }
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

  if (!user.isActive) {
    throw new Error('Contul este dezactivat. Contactează suportul.')
  }

  return user
}

export async function sendOtpCode(data: OtpSendRequest) {
  await clearExpiredOtps()
  // OTP doar pentru conturi existente — nu divulgăm dacă emailul există.
  const user = await findUserByEmail(data.email)
  if (!user || !user.isActive) return null
  const code = String(Math.floor(100000 + Math.random() * 900000))
  await storeOtpCode(data.email, code)
  await sendEmail(data.email, 'Codul tău de autentificare — Clavium', `Codul tău de autentificare Clavium este: ${code}\n\nExpiră în 10 minute.`)
  return code
}

export async function verifyOtpCode(data: OtpVerifyRequest) {
  await clearExpiredOtps()
  const entry = await getOtpCode(data.email)
  if (!entry || entry.code !== sha256(data.code)) {
    throw new Error('Cod OTP invalid sau expirat.')
  }
  await invalidateOtp(data.email)
  const user = await findUserByEmail(data.email)
  // Niciun cont creat automat: OTP autentifică doar utilizatori existenți.
  if (!user || !user.isActive) {
    throw new Error('Nu există un cont activ cu această adresă de email.')
  }
  return user
}
