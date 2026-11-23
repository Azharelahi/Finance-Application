import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteTransactionButton } from "@/features/transactions/delete-transaction-button";
import { getTransaction } from "@/features/transactions/queries";
import { requireUser } from "@/lib/auth-session";
import { formatCalendarDate } from "@/lib/dates/calendar";
import { formatMinor } from "@/lib/money/format";

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const transaction = await getTransaction(user.id, id);
  if (!transaction) notFound();
  return <main className="dashboard-shell"><header className="dashboard-header"><Link className="brand-mark" href="/dashboard/transactions">← Transactions</Link></header><section className="settings-heading"><p className="eyebrow">{transaction.type === "INCOME" ? "Income" : "Expense"} · {formatCalendarDate(transaction.occurredAt)}</p><h1>{transaction.description}</h1><p className="intro">{formatMinor(transaction.amountMinor, transaction.currency)} · {transaction.account.name}{transaction.category ? ` · ${transaction.category.name}` : ""}</p><div className="transaction-actions"><Link className="secondary-button nav-button" href={`/dashboard/transactions/${id}/edit`}>Edit</Link><DeleteTransactionButton id={id} /></div></section></main>;
}
