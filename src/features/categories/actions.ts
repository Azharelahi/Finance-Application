"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-session";
import { categorySchema, recordIdSchema } from "@/lib/validation/finance-settings";

export type CategoryActionState = { error?: string; success?: string };

function readCategory(formData: FormData) {
  return categorySchema.safeParse({ name: formData.get("name"), type: formData.get("type") });
}

function isDuplicate(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createCategory(_state: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const user = await requireUser();
  const parsed = readCategory(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the category details." };

  try {
    const data = parsed.data;
    await prisma.category.create({
      data: { ...data, ownerId: user.id, nameKey: data.name.toLocaleLowerCase("en-US") },
    });
  } catch (error) {
    if (isDuplicate(error)) return { error: "You already have a category with that name, including archived categories." };
    return { error: "We could not save this category. Please try again." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/manage");
  return { success: "Category created." };
}

export async function updateCategory(_state: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const user = await requireUser();
  const id = recordIdSchema.safeParse(formData.get("id"));
  const parsed = readCategory(formData);
  if (!id.success || !parsed.success) return { error: parsed.success ? "This category could not be found." : parsed.error.issues[0]?.message ?? "Check the category details." };

  try {
    const data = parsed.data;
    const result = await prisma.category.updateMany({
      where: { id: id.data, ownerId: user.id, archivedAt: null },
      data: { ...data, nameKey: data.name.toLocaleLowerCase("en-US") },
    });
    if (result.count === 0) return { error: "This category could not be found or is archived." };
  } catch (error) {
    if (isDuplicate(error)) return { error: "You already have a category with that name, including archived categories." };
    return { error: "We could not update this category. Please try again." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/manage");
  return { success: "Category updated." };
}

export async function archiveCategory(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = recordIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  await prisma.category.updateMany({
    where: { id: id.data, ownerId: user.id, archivedAt: null },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/manage");
}

export async function restoreCategory(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = recordIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  await prisma.category.updateMany({ where: { id: id.data, ownerId: user.id, archivedAt: { not: null } }, data: { archivedAt: null } });
  revalidatePath("/dashboard"); revalidatePath("/dashboard/categories"); revalidatePath("/dashboard/manage"); revalidatePath("/dashboard/archives");
}
