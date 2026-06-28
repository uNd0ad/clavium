-- CreateTable
CREATE TABLE "PhotoSignature" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PhotoSignature_hash_idx" ON "PhotoSignature"("hash");

-- CreateIndex
CREATE INDEX "PhotoSignature_propertyId_idx" ON "PhotoSignature"("propertyId");
