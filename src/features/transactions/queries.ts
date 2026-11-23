import { prisma } from "@/lib/prisma";

export function listTransactions(ownerId: string) {
  return prisma.transaction.findMany({
    where: { ownerId },
    include: { account: { select: { name: true } }, category: { select: { name: true } } },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
  });
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
