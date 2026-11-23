import { z } from "zod";
import { isCurrencyCode } from "@/lib/money/format";

const name = z.string().trim().min(1, "Enter a name.").max(60, "Use 60 characters or fewer.");
const accountTypes = ["CASH", "CHECKING", "SAVINGS", "CREDIT_CARD", "INVESTMENT", "OTHER"] as const;
const categoryTypes = ["INCOME", "EXPENSE", "BOTH"] as const;

const minorUnits = z
  .string()
  .trim()
  .regex(/^-?\d+$/, "Enter a whole amount in minor units.")
  .transform(Number)
  .refine(Number.isSafeInteger, "Enter a valid whole amount.")
  .refine((value) => Math.abs(value) <= 2_000_000_000, "Amount is too large.");

export const accountSchema = z.object({
  name,
  type: z.enum(accountTypes),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, "Use a 3-letter uppercase currency code.").refine(isCurrencyCode, "Use a currency code supported by this app."),
  openingBalanceMinor: minorUnits,
});

export const categorySchema = z.object({
  name,
  type: z.enum(categoryTypes),
});

export const recordIdSchema = z.string().min(1).max(64);

export type AccountInput = z.infer<typeof accountSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
