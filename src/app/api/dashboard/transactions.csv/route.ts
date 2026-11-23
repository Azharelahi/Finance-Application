import { requireUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { transactionWhere, type TransactionFilters } from "@/features/transactions/queries";

function csv(value: string | number) {
  let text = String(value);
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const user = await requireUser();
  const params = new URL(request.url).searchParams;
  const date = (v: string | null) => { if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined; const parsed = new Date(`${v}T00:00:00.000Z`); return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === v ? v : undefined; };
  const min = params.get("min"), max = params.get("max");
  const filters: TransactionFilters = {
    q: params.get("q")?.trim().slice(0, 100) || undefined,
    from: date(params.get("from")), to: date(params.get("to")),
    accountId: params.get("account") || undefined, categoryId: params.get("category") || undefined,
    type: params.get("type") === "INCOME" || params.get("type") === "EXPENSE" ? params.get("type") as "INCOME" | "EXPENSE" : undefined,
    min: min && /^\d+$/.test(min) && Number(min) <= 2_000_000_000 ? min : undefined, max: max && /^\d+$/.test(max) && Number(max) <= 2_000_000_000 ? max : undefined,
  };
  if (filters.from && filters.to && filters.from > filters.to) { filters.from = undefined; filters.to = undefined; }
  if (filters.min && filters.max && Number(filters.min) > Number(filters.max)) { filters.min = undefined; filters.max = undefined; }
  const where = transactionWhere(user.id, filters);
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(encoder.encode("Date,Description,Type,Account,Category,Currency,Amount minor units\r\n"));
      let cursor: { id: string } | undefined;
      try {
        while (true) {
          const rows = await prisma.transaction.findMany({ where, take: 500, ...(cursor ? { cursor, skip: 1 } : {}),
            orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }, { id: "desc" }],
            include: { account: { select: { name: true } }, category: { select: { name: true } } },
          });
          if (!rows.length) break;
          const chunk = rows.map(t => [t.occurredAt.toISOString().slice(0, 10), t.description, t.type, t.account.name, t.category?.name ?? "", t.currency, t.amountMinor].map(csv).join(",")).join("\r\n") + "\r\n";
          controller.enqueue(encoder.encode(chunk));
          cursor = { id: rows[rows.length - 1]!.id };
          if (rows.length < 500) break;
        }
        controller.close();
      } catch (error) { controller.error(error); }
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="transactions.csv"', "Cache-Control": "private, no-store" } });
}
