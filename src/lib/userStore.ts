import { prisma } from './prisma'
import type { User } from './types/auth'

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  const existing = await findUserByEmail(email)
  if (existing) {
    throw new Error('Există deja un cont cu acest email.')
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
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
