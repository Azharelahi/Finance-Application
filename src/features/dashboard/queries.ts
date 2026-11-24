import { prisma } from "@/lib/prisma";
import { formatCalendarDate } from "@/lib/dates/calendar";

export async function getDashboardReport(ownerId: string, from: Date, to: Date) {
  const where = { ownerId, occurredAt: { gte: from, lte: to } };
  const [totals, categoryTotals, dailyTotals, categories] = await Promise.all([
    prisma.transaction.groupBy({ by: ["currency", "type"], where, _sum: { amountMinor: true } }),
    prisma.transaction.groupBy({ by: ["currency", "categoryId"], where: { ...where, type: "EXPENSE" }, _sum: { amountMinor: true }, orderBy: { _sum: { amountMinor: "desc" } } }),
    prisma.transaction.groupBy({ by: ["currency", "type", "occurredAt"], where, _sum: { amountMinor: true }, orderBy: { occurredAt: "asc" } }),
    prisma.category.findMany({ where: { ownerId }, select: { id: true, name: true } }),
  ]);

  const currencies = [...new Set([...totals.map((row) => row.currency), ...categoryTotals.map((row) => row.currency)])].sort();
  const summaries = currencies.map((currency) => ({
    currency,
    incomeMinor: totals.find((row) => row.currency === currency && row.type === "INCOME")?._sum.amountMinor ?? 0,
    expenseMinor: totals.find((row) => row.currency === currency && row.type === "EXPENSE")?._sum.amountMinor ?? 0,
  }));
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const spending = currencies.map((currency) => ({
    currency,
    categories: categoryTotals.filter((row) => row.currency === currency).map((row) => ({
      name: row.categoryId ? names.get(row.categoryId) ?? "Archived category" : "Uncategorized",
      amountMinor: row._sum.amountMinor ?? 0,
    })),
  })).filter((group) => group.categories.length > 0);

  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  const dayCount = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const monthly = dayCount > 62;
  const buckets = new Map<string, Map<string, { incomeMinor: number; expenseMinor: number }>>();
  for (let offset = 0; offset < dayCount; offset++) {
    const date = new Date(start.getTime() + offset * 86_400_000);
    const key = monthly ? formatCalendarDate(date).slice(0, 7) : formatCalendarDate(date);
    if (!buckets.has(key)) buckets.set(key, new Map());
  }
  for (const row of dailyTotals) {
    const dateKey = formatCalendarDate(row.occurredAt);
    const key = monthly ? dateKey.slice(0, 7) : dateKey;
    const bucket = buckets.get(key)?.get(row.currency) ?? { incomeMinor: 0, expenseMinor: 0 };
    if (row.type === "INCOME") bucket.incomeMinor += row._sum.amountMinor ?? 0;
    else bucket.expenseMinor += row._sum.amountMinor ?? 0;
    buckets.get(key)?.set(row.currency, bucket);
  }
  const series = currencies.map((currency) => ({
    currency,
    points: [...buckets].map(([date, values]) => ({ date, ...(values.get(currency) ?? { incomeMinor: 0, expenseMinor: 0 }) })),
  }));
  return { summaries, spending, series, monthly };
}
