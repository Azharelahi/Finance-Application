import Link from "next/link";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { requireUser } from "@/lib/auth-session";
import { countActiveAccounts } from "@/features/accounts/queries";
import { countActiveCategories } from "@/features/categories/queries";
import { listAccountBalances } from "@/features/transactions/queries";
import { getDashboardReport } from "@/features/dashboard/queries";
import { ReportCharts } from "@/features/dashboard/report-charts";
import { formatMinor } from "@/lib/money/format";
import { formatCalendarDate, parseCalendarDate } from "@/lib/dates/calendar";

type Search = Record<string, string | string[] | undefined>;
const scalar = (value: string | string[] | undefined) => typeof value === "string" ? value : "";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const params = await searchParams;
  const today = new Date();
  const defaultTo = formatCalendarDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())));
  const defaultFrom = formatCalendarDate(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 365)));
  const rawFrom = scalar(params.from);
  const rawTo = scalar(params.to);
  let fromText = parseCalendarDate(rawFrom) ? rawFrom : defaultFrom;
  let toText = parseCalendarDate(rawTo) ? rawTo : defaultTo;
  let rangeMessage = "";
  if ((rawFrom && !parseCalendarDate(rawFrom)) || (rawTo && !parseCalendarDate(rawTo))) rangeMessage = "Enter valid calendar dates; the last 12 months are shown.";
  if (fromText > toText || (new Date(`${toText}T00:00:00Z`).getTime() - new Date(`${fromText}T00:00:00Z`).getTime()) / 86_400_000 > 365) {
    fromText = defaultFrom;
    toText = defaultTo;
    rangeMessage = "Choose a date range of no more than 366 days; the last 12 months are shown.";
  }
  const from = parseCalendarDate(fromText)!;
  const to = parseCalendarDate(toText)!;
  const [accountCount, categoryCount, balances, report] = await Promise.all([
    countActiveAccounts(user.id), countActiveCategories(user.id), listAccountBalances(user.id), getDashboardReport(user.id, from, to),
  ]);
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand-mark" href="/" aria-label="Finance App home"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link>
        <div className="dashboard-header-actions"><a className="secondary-button nav-button" href="#reports">View charts</a><SignOutButton /></div>
      </header>
      <section className="dashboard-welcome">
        <p className="eyebrow">Your dashboard</p>
        <h1>Welcome, {user.name.split(" ")[0]}.</h1>
        <p className="intro">A clear view of your income, spending, and account balances.</p>
        <div className="dashboard-status"><span className="status-dot" aria-hidden="true" /><span>Signed in as {user.email}</span></div>
      </section>
      <nav className="settings-nav" aria-label="Finance workspace">
        <Link className="settings-nav-card" href="/dashboard/transactions"><span className="setup-icon" aria-hidden="true">↕</span><span><strong>Transactions</strong><small>Review, filter, export, or add activity</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link>
        <Link className="settings-nav-card" href="/dashboard/manage"><span className="setup-icon" aria-hidden="true">☷</span><span><strong>Accounts & categories</strong><small>{accountCount} accounts · {categoryCount} categories · archives</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link>
      </nav>

      <section className="balance-section" aria-labelledby="range-title">
        <div className="section-title-row"><div><p className="eyebrow">Reporting period</p><h2 id="range-title">Income and expenses</h2></div><Link className="text-link" href="/dashboard/transactions?add=1#quick-add">Add transaction</Link></div>
        <form className="date-range-form" method="get" action="/dashboard">
          <label className="filter-field">From<input className="form-input" type="date" name="from" defaultValue={fromText} required /></label>
          <label className="filter-field">To<input className="form-input" type="date" name="to" defaultValue={toText} required /></label>
          <button className="primary-button" type="submit">Update period</button>
        </form>
        <p className="range-hint">Select a period up to 366 days. Values are grouped by currency and are never added across currencies.</p>
        {rangeMessage && <p className="range-message" role="status">{rangeMessage}</p>}
        <div className="summary-grid" aria-label="Period totals">{report.summaries.length === 0 ? <p className="report-empty">No transaction totals for this period.</p> : report.summaries.map((item) => <article className="summary-card" key={item.currency}><span>{item.currency} income</span><strong className="summary-income">{formatMinor(item.incomeMinor, item.currency)}</strong><span>{item.currency} expenses</span><strong>{formatMinor(item.expenseMinor, item.currency)}</strong></article>)}</div>
      </section>
      <ReportCharts spending={report.spending} series={report.series} monthly={report.monthly}/>

      <section className="balance-section"><div className="section-title-row"><div><p className="eyebrow">Current balances</p><h2>By account</h2></div></div>
        {balances.length === 0 ? <p className="balance-empty">Create an account to see its balance here.</p> : <div className="balance-grid">{balances.map((account) => <article className="balance-card" key={account.id}><span>{account.name} · {account.currency}</span><strong>{formatMinor(account.balanceMinor, account.currency)}</strong></article>)}</div>}
      </section>
      <footer className="page-footer">Your financial information belongs to you.</footer>
    </main>
  );
}
