import { prisma } from "@/lib/prisma";
import type { CategoryType } from "@/generated/prisma/client";

export function listActiveCategories(ownerId: string) {
  return prisma.category.findMany({
    where: { ownerId, archivedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function listCategoryOptions(ownerId: string, type?: Exclude<CategoryType, "BOTH">, selectedId?: string) {
  const active = await prisma.category.findMany({
    where: {
      ownerId,
      archivedAt: null,
      ...(type ? { type: { in: [type, "BOTH"] } } : {}),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true },
  });
  if (!selectedId || active.some((category) => category.id === selectedId)) return active.map((category) => ({ ...category, archived: false }));
  const archivedSelection = await prisma.category.findFirst({
    where: { id: selectedId, ownerId, archivedAt: { not: null }, ...(type ? { type: { in: [type, "BOTH"] } } : {}) },
    select: { id: true, name: true, type: true },
  });
  return [...active.map((category) => ({ ...category, archived: false })), ...(archivedSelection ? [{ ...archivedSelection, archived: true }] : [])];
}

export function countActiveCategories(ownerId: string) {
  return prisma.category.count({ where: { ownerId, archivedAt: null } });
}
