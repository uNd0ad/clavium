-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3);
