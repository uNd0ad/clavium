import { prisma } from './prisma'
import type { User } from './types/auth'
import type { UserRole } from './types/roles'
import { ROLES, isValidRole } from './types/roles'

function mapUserRole(role: string): UserRole {
  return isValidRole(role) ? role : ROLES.CLIENT
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (!user) return null
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
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function createUser(firstName: string, lastName: string, email: string, passwordHash: string, role?: UserRole): Promise<User> {
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
    },
  })

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
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
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
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

export async function storeOtpCode(email: string, code: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10)
  await prisma.otp.create({
    data: {
      email: email.toLowerCase(),
      code,
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
