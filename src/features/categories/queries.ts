import { prisma } from "@/lib/prisma";
import type { CategoryType } from "@/generated/prisma/client";

export function listActiveCategories(ownerId: string) {
  return prisma.category.findMany({
    where: { ownerId, archivedAt: null },
    orderBy: { name: "asc" },
  });
}

export function listCategoryOptions(ownerId: string, type?: Exclude<CategoryType, "BOTH">) {
  return prisma.category.findMany({
    where: {
      ownerId,
      archivedAt: null,
      ...(type ? { type: { in: [type, "BOTH"] } } : {}),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export function countActiveCategories(ownerId: string) {
  return prisma.category.count({ where: { ownerId, archivedAt: null } });
}
