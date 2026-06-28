import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/lib/session'
import type { UserRole } from '@/lib/types/roles'

// Golește tabelele în ordine sigură pentru cheile externe.
export async function resetDb() {
  await prisma.auditLog.deleteMany()
  await prisma.report.deleteMany()
  await prisma.termsConsent.deleteMany()
  await prisma.review.deleteMany()
  await prisma.photoSignature.deleteMany()
  await prisma.ticketRead.deleteMany()
  await prisma.ticketMessage.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.signature.deleteMany()
  await prisma.contract.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.savedProperty.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.kycVerification.deleteMany()
  await prisma.inquiryMessage.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.property.deleteMany()
  await prisma.session.deleteMany()
  await prisma.emailToken.deleteMany()
  await prisma.phoneOtp.deleteMany()
  await prisma.otp.deleteMany()
  await prisma.user.deleteMany()
}

export async function makeUser(role: UserRole, email: string) {
  return prisma.user.create({
    data: { firstName: 'Test', lastName: role, email, passwordHash: 'x', role, emailVerified: true, phoneVerified: true },
  })
}

export function sessionFor(user: { id: string; firstName: string; lastName: string; role: string; email: string }): SessionUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as UserRole,
    email: user.email,
    emailVerified: true,
    kycStatus: 'VERIFIED',
    accountType: 'PERSON',
    companyVatPayer: false,
  }
}
