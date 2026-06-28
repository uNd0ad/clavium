-- CreateTable
CREATE TABLE "TermsConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TermsConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TermsConsent_userId_idx" ON "TermsConsent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TermsConsent_userId_version_key" ON "TermsConsent"("userId", "version");

-- AddForeignKey
ALTER TABLE "TermsConsent" ADD CONSTRAINT "TermsConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
