import Link from "next/link";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { requireUser } from "@/lib/auth-session";
import { listAccountOptions } from "@/features/accounts/queries";
import { AccountSelect } from "@/components/forms/account-select";
import { listCategoryOptions } from "@/features/categories/queries";

export default async function NewTransactionPage() {
  const user = await requireUser();
  const [accounts, categories] = await Promise.all([listAccountOptions(user.id), listCategoryOptions(user.id)]);
  return <main className="dashboard-shell"><header className="dashboard-header"><Link className="brand-mark" href="/dashboard/transactions">← Transactions</Link></header><section className="settings-heading"><p className="eyebrow">New activity</p><h1>Record a transaction</h1><p className="intro">Amounts are positive; choose income or expense to determine how the account balance changes.</p></section>{accounts.length === 0 ? <article className="empty-state"><h2>Add an account first</h2><p>Transactions need an active account. Create one in account settings before continuing.</p><Link className="text-link" href="/dashboard/manage#accounts">Go to account settings</Link></article> : <article className="settings-card transaction-form-card"><TransactionForm accountSelect={<AccountSelect />} categories={categories} /></article>}</main>;
}
