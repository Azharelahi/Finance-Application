import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const TRANSACTION_PAGE_SIZE = 20;

export type TransactionFilters = { q?: string; from?: string; to?: string; accountId?: string; categoryId?: string; type?: "INCOME" | "EXPENSE"; min?: string; max?: string };

export function transactionWhere(ownerId: string, filters: TransactionFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { ownerId };
  if (filters.q) {
    const q = filters.q.slice(0, 100);
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { account: { name: { contains: q, mode: "insensitive" } } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (filters.type) where.type = filters.type;
  if (filters.accountId) where.accountId = filters.accountId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.from || filters.to) {
    where.occurredAt = { ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000Z`) } : {}), ...(filters.to ? { lte: new Date(`${filters.to}T00:00:00.000Z`) } : {}) };
  }
  if (filters.min || filters.max) where.amountMinor = { ...(filters.min ? { gte: Number(filters.min) } : {}), ...(filters.max ? { lte: Number(filters.max) } : {}) };
  return where;
}

export function listTransactions(ownerId: string, filters: TransactionFilters = {}, page = 1) {
  const where = transactionWhere(ownerId, filters);
  const safePage = Math.max(1, Math.min(100000, page));
  return Promise.all([prisma.transaction.findMany({
    where,
    include: { account: { select: { name: true } }, category: { select: { name: true } } },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    skip: (safePage - 1) * TRANSACTION_PAGE_SIZE, take: TRANSACTION_PAGE_SIZE,
  }),
  prisma.transaction.count({ where }),
  ]);
}

export function getTransaction(ownerId: string, id: string) {
  return prisma.transaction.findFirst({
    where: { id, ownerId },
    include: { account: { select: { name: true } }, category: { select: { name: true } } },
  });
}

export async function listAccountBalances(ownerId: string) {
  const [accounts, totals] = await Promise.all([
    prisma.financeAccount.findMany({
      where: { ownerId, archivedAt: null },
      select: { id: true, name: true, currency: true, openingBalanceMinor: true },
      orderBy: { name: "asc" },
    }),
    prisma.transaction.groupBy({
      by: ["accountId", "type"],
      where: { ownerId },
      _sum: { amountMinor: true },
    }),
  ]);

  return accounts.map((account) => {
    const income = totals.find((row) => row.accountId === account.id && row.type === "INCOME")?._sum.amountMinor ?? 0;
    const expenses = totals.find((row) => row.accountId === account.id && row.type === "EXPENSE")?._sum.amountMinor ?? 0;
    return { ...account, balanceMinor: account.openingBalanceMinor + income - expenses };
  });
}
