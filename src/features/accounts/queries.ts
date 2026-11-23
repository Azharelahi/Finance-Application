import { prisma } from "@/lib/prisma";

export function listActiveAccounts(ownerId: string) {
  return prisma.financeAccount.findMany({
    where: { ownerId, archivedAt: null },
    orderBy: { name: "asc" },
  });
}

export function listAccountOptions(ownerId: string) {
  return prisma.financeAccount.findMany({
    where: { ownerId, archivedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, currency: true },
  });
}

export function countActiveAccounts(ownerId: string) {
  return prisma.financeAccount.count({ where: { ownerId, archivedAt: null } });
}
