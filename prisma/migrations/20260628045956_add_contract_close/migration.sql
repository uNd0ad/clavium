-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "depositStatus" TEXT NOT NULL DEFAULT 'HELD';
