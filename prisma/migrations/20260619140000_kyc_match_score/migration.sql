-- Verificare KYC prin potrivire facială locală (fără eIDAS): scorul de potrivire + metoda implicită.

-- AlterTable
ALTER TABLE "KycVerification" ADD COLUMN "matchScore" DOUBLE PRECISION;
ALTER TABLE "KycVerification" ALTER COLUMN "method" SET DEFAULT 'face_match';
