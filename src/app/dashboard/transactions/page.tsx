import Link from "next/link";
import { requireUser } from "@/lib/auth-session";
import { listTransactions } from "@/features/transactions/queries";
import { formatMinor } from "@/lib/money/format";
import { formatCalendarDate } from "@/lib/dates/calendar";

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await listTransactions(user.id);
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header"><Link className="brand-mark" href="/dashboard"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link><Link className="secondary-button nav-button" href="/dashboard">Dashboard</Link></header>
      <section className="settings-heading"><p className="eyebrow">Your activity</p><h1>Transactions</h1><p className="intro">Record income and expenses. Each account balance is derived from its opening balance and transactions.</p><Link className="primary-button nav-button" href="/dashboard/transactions/new">Add transaction</Link></section>
      <section className="settings-list" aria-label="Transactions">
        {transactions.length === 0 ? <div className="empty-state"><h2>No transactions yet</h2><p>Record your first income or expense to see your account activity here.</p></div> : transactions.map((transaction) => (
          <Link className="transaction-row" href={`/dashboard/transactions/${transaction.id}`} key={transaction.id}>
            <span className="transaction-copy"><strong>{transaction.description}</strong><small>{formatCalendarDate(transaction.occurredAt)} · {transaction.account.name}{transaction.category ? ` · ${transaction.category.name}` : ""}</small></span>
            <span className={`transaction-amount ${transaction.type === "INCOME" ? "income" : "expense"}`}>{transaction.type === "EXPENSE" ? "−" : "+"}{formatMinor(transaction.amountMinor, transaction.currency)}</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
