-- Verificare identitate (KYC): coloană de stare pe User + dosar de verificare per utilizator.

-- AlterTable
ALTER TABLE "User" ADD COLUMN "kycStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'dev',
    "reference" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'id_document',
    "documentHashes" TEXT NOT NULL DEFAULT '[]',
    "documentCount" INTEGER NOT NULL DEFAULT 0,
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KycVerification_userId_key" ON "KycVerification"("userId");

-- AddForeignKey
ALTER TABLE "KycVerification" ADD CONSTRAINT "KycVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
