-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INCHIRIERE',
    "rent" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "months" INTEGER NOT NULL DEFAULT 12,
    "deposit" INTEGER NOT NULL DEFAULT 0,
    "dueDay" INTEGER NOT NULL DEFAULT 5,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "clauses" TEXT,
    "signedByOwner" BOOLEAN NOT NULL DEFAULT false,
    "signedByClient" BOOLEAN NOT NULL DEFAULT false,
    "qes" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'IN_ASTEPTARE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contract_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Contract" ("clauses", "createdAt", "deposit", "dueDay", "endDate", "id", "months", "ownerId", "propertyId", "qes", "rent", "signedByClient", "signedByOwner", "startDate", "status", "tenantId") SELECT "clauses", "createdAt", "deposit", "dueDay", "endDate", "id", "months", "ownerId", "propertyId", "qes", "rent", "signedByClient", "signedByOwner", "startDate", "status", "tenantId" FROM "Contract";
DROP TABLE "Contract";
ALTER TABLE "new_Contract" RENAME TO "Contract";
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL DEFAULT 'INCHIRIERE',
    "rent" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "rooms" INTEGER,
    "surface" INTEGER,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DISPONIBILA',
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("createdAt", "description", "id", "location", "ownerId", "photos", "rent", "rooms", "status", "surface", "title", "updatedAt") SELECT "createdAt", "description", "id", "location", "ownerId", "photos", "rent", "rooms", "status", "surface", "title", "updatedAt" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
