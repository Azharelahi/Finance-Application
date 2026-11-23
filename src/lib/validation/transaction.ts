import { z } from "zod";
import { parseCalendarDate } from "@/lib/dates/calendar";

export const transactionSchema = z.object({
  accountId: z.string().min(1).max(64),
  categoryId: z.string().max(64).optional().transform((value) => value || undefined),
  amount: z.string().trim().max(24).regex(/^\d+(?:\.\d+)?$/, "Enter a positive amount."),
  type: z.enum(["INCOME", "EXPENSE"]),
  occurredAt: z.string().refine((value) => parseCalendarDate(value) !== null, "Enter a valid date."),
  description: z.string().trim().min(1, "Enter a description.").max(240, "Use 240 characters or fewer."),
});

export const transactionIdSchema = z.string().min(1).max(64);
export type TransactionInput = z.infer<typeof transactionSchema>;
