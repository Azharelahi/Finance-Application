"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-session";
import { accountSchema, recordIdSchema } from "@/lib/validation/finance-settings";

export type AccountActionState = { error?: string; success?: string };

function readAccount(formData: FormData) {
  return accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    currency: formData.get("currency"),
    openingBalanceMinor: formData.get("openingBalanceMinor"),
  });
}

function isDuplicate(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createAccount(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const user = await requireUser();
  const parsed = readAccount(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the account details." };

  try {
    const data = parsed.data;
    await prisma.financeAccount.create({
      data: { ...data, ownerId: user.id, nameKey: data.name.toLocaleLowerCase("en-US") },
    });
  } catch (error) {
    if (isDuplicate(error)) return { error: "You already have an account with that name, including archived accounts." };
    return { error: "We could not save this account. Please try again." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/accounts");
  return { success: "Account created." };
}

export async function updateAccount(_state: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const user = await requireUser();
  const id = recordIdSchema.safeParse(formData.get("id"));
  const parsed = readAccount(formData);
  if (!id.success || !parsed.success) return { error: parsed.success ? "This account could not be found." : parsed.error.issues[0]?.message ?? "Check the account details." };

  try {
    const data = parsed.data;
    const result = await prisma.financeAccount.updateMany({
      where: { id: id.data, ownerId: user.id, archivedAt: null },
      data: { ...data, nameKey: data.name.toLocaleLowerCase("en-US") },
    });
    if (result.count === 0) return { error: "This account could not be found or is archived." };
  } catch (error) {
    if (isDuplicate(error)) return { error: "You already have an account with that name, including archived accounts." };
    return { error: "We could not update this account. Please try again." };
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/accounts");
  return { success: "Account updated." };
}

export async function archiveAccount(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = recordIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  await prisma.financeAccount.updateMany({
    where: { id: id.data, ownerId: user.id, archivedAt: null },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/accounts");
}
