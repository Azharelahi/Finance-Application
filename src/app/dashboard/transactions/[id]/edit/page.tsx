import Link from "next/link";
import { notFound } from "next/navigation";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { getTransaction } from "@/features/transactions/queries";
import { requireUser } from "@/lib/auth-session";
import { AccountSelect } from "@/components/forms/account-select";
import { listCategoryOptions } from "@/features/categories/queries";

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const transaction = await getTransaction(user.id, id);
  if (!transaction) notFound();
  const categories = await listCategoryOptions(user.id, undefined, transaction.categoryId ?? undefined);
  return <main className="dashboard-shell"><header className="dashboard-header"><Link className="brand-mark" href={`/dashboard/transactions/${id}`}>← Transaction details</Link></header><section className="settings-heading"><p className="eyebrow">Update activity</p><h1>Edit transaction</h1></section><article className="settings-card transaction-form-card"><TransactionForm transaction={transaction} accountSelect={<AccountSelect selectedId={transaction.accountId} />} categories={categories} /></article></main>;
}
