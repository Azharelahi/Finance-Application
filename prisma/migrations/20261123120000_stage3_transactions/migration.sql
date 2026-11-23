-- Transaction amounts are positive minor units; type determines balance direction.
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

CREATE TABLE "finance_transaction" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "occurredAt" DATE NOT NULL,
    "description" VARCHAR(240) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "finance_transaction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "finance_transaction_amount_positive" CHECK ("amountMinor" > 0),
    CONSTRAINT "finance_transaction_owner_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "finance_transaction_account_fkey" FOREIGN KEY ("accountId") REFERENCES "finance_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "finance_transaction_category_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "finance_transaction_ownerId_occurredAt_id_idx" ON "finance_transaction"("ownerId", "occurredAt", "id");
CREATE INDEX "finance_transaction_ownerId_accountId_occurredAt_idx" ON "finance_transaction"("ownerId", "accountId", "occurredAt");
CREATE INDEX "finance_transaction_ownerId_categoryId_occurredAt_idx" ON "finance_transaction"("ownerId", "categoryId", "occurredAt");
