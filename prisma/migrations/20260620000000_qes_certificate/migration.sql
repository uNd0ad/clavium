-- Semnătură QES cu certificat încărcat de semnatar (toate coloanele opționale: semnăturile vechi nu le au).
-- AlterTable
ALTER TABLE "Signature" ADD COLUMN     "certificatePem" TEXT,
ADD COLUMN     "certSubject" TEXT,
ADD COLUMN     "certIssuer" TEXT,
ADD COLUMN     "certSerial" TEXT,
ADD COLUMN     "certNotAfter" TIMESTAMP(3),
ADD COLUMN     "signatureValue" TEXT,
ADD COLUMN     "signatureAlgo" TEXT,
ADD COLUMN     "validationStatus" TEXT;
