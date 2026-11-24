import Link from "next/link";
import { requireUser } from "@/lib/auth-session";
import { listTransactions, TRANSACTION_PAGE_SIZE, type TransactionFilters } from "@/features/transactions/queries";
import { formatMinor } from "@/lib/money/format";
import { formatCalendarDate } from "@/lib/dates/calendar";
import { prisma } from "@/lib/prisma";
import { AccountSelect } from "@/components/forms/account-select";
import { listCategoryOptions } from "@/features/categories/queries";
import { TransactionForm } from "@/features/transactions/transaction-form";

type Search = Record<string, string | string[] | undefined>;
function scalar(value: string | string[] | undefined) { return typeof value === "string" ? value : ""; }
function validDate(value: string) { const parsed = new Date(`${value}T00:00:00.000Z`); return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? value : ""; }

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const params = await searchParams;
  const filters: TransactionFilters = {
    q: scalar(params.q).trim().slice(0, 100), from: validDate(scalar(params.from)), to: validDate(scalar(params.to)),
    accountId: scalar(params.account), categoryId: scalar(params.category),
    type: scalar(params.type) === "INCOME" || scalar(params.type) === "EXPENSE" ? scalar(params.type) as "INCOME" | "EXPENSE" : undefined,
    min: /^\d+$/.test(scalar(params.min)) && Number(scalar(params.min)) <= 2_000_000_000 ? scalar(params.min) : "", max: /^\d+$/.test(scalar(params.max)) && Number(scalar(params.max)) <= 2_000_000_000 ? scalar(params.max) : "",
  };
  if (filters.from && filters.to && filters.from > filters.to) { filters.from = ""; filters.to = ""; }
  if (filters.min && filters.max && Number(filters.min) > Number(filters.max)) { filters.min = ""; filters.max = ""; }
  const page = Math.max(1, Math.min(100000, Number.parseInt(scalar(params.page), 10) || 1));
  const [[transactions, count], accounts, categories, transactionCategories] = await Promise.all([
    listTransactions(user.id, filters, page),
    prisma.financeAccount.findMany({ where: { ownerId: user.id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { ownerId: user.id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    listCategoryOptions(user.id),
  ]);
  const pages = Math.max(1, Math.ceil(count / TRANSACTION_PAGE_SIZE));
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key === "accountId" ? "account" : key === "categoryId" ? "category" : key, value);
  const pageLink = (n: number) => { const p = new URLSearchParams(query); p.set("page", String(n)); return `?${p}`; };
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header"><Link className="brand-mark" href="/dashboard"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link><Link className="secondary-button nav-button" href="/dashboard">Dashboard</Link></header>
      <section className="settings-heading"><p className="eyebrow">Your activity</p><h1>Transactions</h1><p className="intro">Record, search, filter, and export activity in one place.</p><div className="transaction-actions"><a className="secondary-button nav-button" href={`/api/dashboard/transactions.csv?${query}`}>Export CSV</a></div></section>
      <details id="quick-add" className="quick-add" open><summary>Add a transaction</summary><article className="settings-card transaction-form-card"><TransactionForm accountSelect={<AccountSelect />} categories={transactionCategories}/></article></details>
      <form className="filter-card" method="get" action="/dashboard/transactions">
        <label className="filter-field">Search description<input className="form-input" name="q" defaultValue={filters.q} maxLength={100} /></label>
        <label className="filter-field">From<input className="form-input" type="date" name="from" defaultValue={filters.from} /></label>
        <label className="filter-field">To<input className="form-input" type="date" name="to" defaultValue={filters.to} /></label>
        <label className="filter-field">Account<select className="form-input" name="account" defaultValue={filters.accountId}><option value="">All accounts</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label className="filter-field">Category<select className="form-input" name="category" defaultValue={filters.categoryId}><option value="">All categories</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="filter-field">Type<select className="form-input" name="type" defaultValue={filters.type ?? ""}><option value="">Income and expense</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></label>
        <label className="filter-field">Min amount (minor units)<input className="form-input" inputMode="numeric" name="min" defaultValue={filters.min} /></label>
        <label className="filter-field">Max amount (minor units)<input className="form-input" inputMode="numeric" name="max" defaultValue={filters.max} /></label>
        <div className="filter-actions"><button className="primary-button" type="submit">Apply filters</button><Link className="text-link" href="/dashboard/transactions">Clear</Link></div>
      </form>
      <p className="result-count">{count} {count === 1 ? "transaction" : "transactions"}{count > 0 ? ` · Page ${page} of ${pages}` : ""}</p>
      <section className="settings-list" aria-label="Transactions">
        {transactions.length === 0 ? <div className="empty-state"><h2>No matching transactions</h2><p>Try changing or clearing your filters.</p></div> : transactions.map((transaction) => (
          <Link className="transaction-row" href={`/dashboard/transactions/${transaction.id}`} key={transaction.id}>
            <span className="transaction-copy"><strong>{transaction.description}</strong><small>{formatCalendarDate(transaction.occurredAt)} · {transaction.account.name}{transaction.category ? ` · ${transaction.category.name}` : ""}</small></span>
            <span className={`transaction-amount ${transaction.type === "INCOME" ? "income" : "expense"}`}>{transaction.type === "EXPENSE" ? "−" : "+"}{formatMinor(transaction.amountMinor, transaction.currency)}</span>
          </Link>
        ))}
      </section>
      {count > 0 && <nav className="pagination" aria-label="Transaction pages">{page > 1 ? <Link className="secondary-button nav-button" href={pageLink(page - 1)}>Previous</Link> : <span />}{page < pages ? <Link className="secondary-button nav-button" href={pageLink(page + 1)}>Next</Link> : <span />}</nav>}
    </main>
  );
}
