-- AlterTable
ALTER TABLE "KycVerification" ADD COLUMN     "documentKeys" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "biometricConsentAt" TIMESTAMP(3),
ADD COLUMN     "biometricPurgedAt" TIMESTAMP(3);
