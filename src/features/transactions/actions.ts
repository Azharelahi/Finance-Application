"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-session";
import { parseCalendarDate } from "@/lib/dates/calendar";
import { parseMajorToMinor } from "@/lib/money/format";
import { transactionIdSchema, transactionSchema } from "@/lib/validation/transaction";

export type TransactionActionState = { error?: string; success?: string };

function readInput(formData: FormData) {
  return transactionSchema.safeParse({
    accountId: formData.get("accountId"), categoryId: formData.get("categoryId") || undefined,
    amount: formData.get("amount"), type: formData.get("type"), occurredAt: formData.get("occurredAt"),
    description: formData.get("description"),
  });
}

async function checkReferences(tx: Prisma.TransactionClient, ownerId: string, input: typeof transactionSchema._output, allowArchived = false) {
  const account = await tx.financeAccount.findFirst({
    where: { id: input.accountId, ownerId, ...(allowArchived ? {} : { archivedAt: null }) }, select: { id: true, currency: true },
  });
  if (!account) return { error: "Choose one of your active accounts." } as const;
  const amountMinor = parseMajorToMinor(input.amount, account.currency);
  if (amountMinor === null) return { error: `Enter a positive ${account.currency} amount with no more precision than that currency supports (maximum 2,000,000,000 minor units).` } as const;

  if (input.categoryId) {
    const category = await tx.category.findFirst({
      where: { id: input.categoryId, ownerId, ...(allowArchived ? {} : { archivedAt: null }) }, select: { type: true },
    });
    if (!category || (category.type !== "BOTH" && category.type !== input.type)) {
      return { error: `This category can’t be used for ${input.type.toLowerCase()}. Choose a matching category or change its setting to “Income and expenses”.` } as const;
    }
  }
  return { account, amountMinor, occurredAt: parseCalendarDate(input.occurredAt)! } as const;
}

function isConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003"].includes(error.code);
}

export async function createTransaction(_state: TransactionActionState, formData: FormData): Promise<TransactionActionState> {
  const user = await requireUser();
  const input = readInput(formData);
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Check the transaction details." };
  try {
    const result = await prisma.$transaction(async (tx) => {
      const refs = await checkReferences(tx, user.id, input.data);
      if ("error" in refs) return refs;
      await tx.transaction.create({ data: {
        ownerId: user.id, accountId: refs.account.id, categoryId: input.data.categoryId,
        amountMinor: refs.amountMinor, currency: refs.account.currency, type: input.data.type,
        occurredAt: refs.occurredAt, description: input.data.description,
      } });
      return { success: "Transaction recorded." } as const;
    });
    if ("error" in result) return result;
  } catch (error) {
    if (isConstraintError(error)) return { error: "The selected account or category is no longer available." };
    return { error: "We could not save this transaction. Please try again." };
  }
  revalidatePath("/dashboard"); revalidatePath("/dashboard/transactions");
  return { success: "Transaction recorded." };
}

export async function updateTransaction(_state: TransactionActionState, formData: FormData): Promise<TransactionActionState> {
  const user = await requireUser();
  const id = transactionIdSchema.safeParse(formData.get("id"));
  const input = readInput(formData);
  if (!id.success) return { error: "This transaction could not be found." };
  if (!input.success) return { error: input.error.issues[0]?.message ?? "Check the transaction details." };
  try {
    const result = await prisma.$transaction(async (tx) => {
      const refs = await checkReferences(tx, user.id, input.data, true);
      if ("error" in refs) return refs;
      const changed = await tx.transaction.updateMany({
        where: { id: id.data, ownerId: user.id },
        data: {
          accountId: refs.account.id, categoryId: input.data.categoryId ?? null,
          amountMinor: refs.amountMinor, currency: refs.account.currency, type: input.data.type,
          occurredAt: refs.occurredAt, description: input.data.description,
        },
      });
      return changed.count ? ({ success: "Transaction updated." } as const) : ({ error: "This transaction could not be found." } as const);
    });
    if ("error" in result) return result;
  } catch (error) {
    if (isConstraintError(error)) return { error: "The selected account or category is no longer available." };
    return { error: "We could not update this transaction. Please try again." };
  }
  revalidatePath("/dashboard"); revalidatePath("/dashboard/transactions");
  return { success: "Transaction updated." };
}

export async function deleteTransaction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = transactionIdSchema.safeParse(formData.get("id"));
  if (!id.success) return;
  await prisma.transaction.deleteMany({ where: { id: id.data, ownerId: user.id } });
  revalidatePath("/dashboard"); revalidatePath("/dashboard/transactions");
}
