-- CreateEnum
CREATE TYPE "FinanceAccountType" AS ENUM ('CASH', 'CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE', 'BOTH');

-- CreateTable
CREATE TABLE "finance_account" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "type" "FinanceAccountType" NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "openingBalanceMinor" INTEGER NOT NULL DEFAULT 0,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finance_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL DEFAULT 'BOTH',
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "finance_account_ownerId_archivedAt_idx" ON "finance_account"("ownerId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "finance_account_ownerId_nameKey_key" ON "finance_account"("ownerId", "nameKey");

-- CreateIndex
CREATE INDEX "category_ownerId_archivedAt_idx" ON "category"("ownerId", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "category_ownerId_nameKey_key" ON "category"("ownerId", "nameKey");

-- AddForeignKey
ALTER TABLE "finance_account" ADD CONSTRAINT "finance_account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
