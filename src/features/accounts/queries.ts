import { prisma } from "@/lib/prisma";

export function listActiveAccounts(ownerId: string) {
  return prisma.financeAccount.findMany({
    where: { ownerId, archivedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function listAccountOptions(ownerId: string, selectedId?: string) {
  const active = await prisma.financeAccount.findMany({
    where: { ownerId, archivedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, currency: true },
  });
  if (!selectedId || active.some((account) => account.id === selectedId)) return active.map((account) => ({ ...account, archived: false }));
  const archivedSelection = await prisma.financeAccount.findFirst({
    where: { id: selectedId, ownerId, archivedAt: { not: null } },
    select: { id: true, name: true, currency: true },
  });
  return [...active.map((account) => ({ ...account, archived: false })), ...(archivedSelection ? [{ ...archivedSelection, archived: true }] : [])];
}

export function countActiveAccounts(ownerId: string) {
  return prisma.financeAccount.count({ where: { ownerId, archivedAt: null } });
}
