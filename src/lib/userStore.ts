import { prisma } from './prisma'
import { sha256 } from './hash'
import type { User } from '@prisma/client'
import type { User as AppUser, CompanyInput, AccountType } from './types/auth'
import type { UserRole } from './types/roles'
import { ROLES, isValidRole } from './types/roles'

function mapUserRole(role: string): UserRole {
  return isValidRole(role) ? role : ROLES.CLIENT
}

// Mapper unic Prisma → tipul aplicației (folosit de toate funcțiile de citire).
function toUser(user: User): AppUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    passwordHash: user.passwordHash,
    role: mapUserRole(user.role),
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    avatar: user.avatar,
    accountType: (user.accountType as AccountType) || 'PERSON',
    companyName: user.companyName,
    companyCui: user.companyCui,
    companyReg: user.companyReg,
    companyAddress: user.companyAddress,
    companyVatPayer: user.companyVatPayer,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    return user ? toUser(user) : null
  } catch (err) {
    console.error('findUserByEmail error:', err)
    return null
  }
}

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  passwordHash: string,
  role?: UserRole,
  phone?: string,
  company?: CompanyInput
): Promise<AppUser> {
  const existing = await findUserByEmail(email)
  if (existing) {
    throw new Error('Există deja un cont cu acest email.')
  }

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      role: role || ROLES.CLIENT,
      phone: phone || null,
      phoneVerified: Boolean(phone),
      accountType: company ? 'COMPANY' : 'PERSON',
      companyName: company?.name ?? null,
      companyCui: company?.cui ?? null,
      companyReg: company?.reg ?? null,
      companyAddress: company?.address ?? null,
      companyVatPayer: company?.vatPayer ?? false,
    },
  })

  return toUser(user)
}

export async function getUserById(id: string): Promise<AppUser | null> {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    return user ? toUser(user) : null
  } catch (err) {
    console.error('getUserById error:', err)
    return null
  }
}

export async function storeOtpCode(email: string, code: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10)
  await prisma.otp.create({
    data: {
      email: email.toLowerCase(),
      code: sha256(code),
      expiresAt,
    },
  })
}

export async function getOtpCode(email: string) {
  const otp = await prisma.otp.findFirst({
    where: {
      email: email.toLowerCase(),
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return otp ? { code: otp.code, expiresAt: otp.expiresAt.getTime() } : null
}

export async function invalidateOtp(email: string) {
  await prisma.otp.deleteMany({ where: { email: email.toLowerCase() } })
}

export async function clearExpiredOtps() {
  await prisma.otp.deleteMany({ where: { expiresAt: { lte: new Date() } } })
}

export function normalizePhone(phone: string) {
  return phone.replace(/[\s.-]/g, '')
}

export async function storePhoneOtp(phone: string, code: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10)
  await prisma.phoneOtp.deleteMany({ where: { phone: normalizePhone(phone) } })
  await prisma.phoneOtp.create({
    data: { phone: normalizePhone(phone), code: sha256(code), expiresAt },
  })
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<boolean> {
  const entry = await prisma.phoneOtp.findFirst({
    where: {
      phone: normalizePhone(phone),
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })
  if (!entry || entry.code !== sha256(code)) return false
  await prisma.phoneOtp.update({
    where: { id: entry.id },
    data: { verifiedAt: new Date() },
  })
  return true
}

export async function isPhoneVerified(phone: string): Promise<boolean> {
  const entry = await prisma.phoneOtp.findFirst({
    where: {
      phone: normalizePhone(phone),
      verifiedAt: { not: null },
      // verificarea rămâne valabilă 30 de minute, cât durează completarea formularului
      createdAt: { gt: new Date(Date.now() - 1000 * 60 * 30) },
    },
  })
  return Boolean(entry)
}

export async function consumePhoneOtp(phone: string) {
  await prisma.phoneOtp.deleteMany({ where: { phone: normalizePhone(phone) } })
}
