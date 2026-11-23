import Link from "next/link";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { requireUser } from "@/lib/auth-session";
import { countActiveAccounts } from "@/features/accounts/queries";
import { countActiveCategories } from "@/features/categories/queries";
import { listAccountBalances } from "@/features/transactions/queries";
import { formatMinor } from "@/lib/money/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const [accountCount, categoryCount, balances] = await Promise.all([
    countActiveAccounts(user.id),
    countActiveCategories(user.id),
    listAccountBalances(user.id),
  ]);
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand-mark" href="/" aria-label="Finance App home"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link>
        <SignOutButton />
      </header>
      <section className="dashboard-welcome">
        <p className="eyebrow">Your dashboard</p>
        <h1>Welcome, {user.name.split(" ")[0]}.</h1>
        <p className="intro">Your private finance workspace keeps accounts, categories, transactions, and derived balances together.</p>
        <div className="dashboard-status"><span className="status-dot" aria-hidden="true" /><span>Signed in as {user.email}</span></div>
      </section>
      <nav className="settings-nav" aria-label="Finance settings">
        <Link className="settings-nav-card" href="/dashboard/accounts"><span className="setup-icon" aria-hidden="true">$</span><span><strong>Accounts</strong><small>{accountCount} active</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link>
        <Link className="settings-nav-card" href="/dashboard/categories"><span className="setup-icon" aria-hidden="true">✦</span><span><strong>Categories</strong><small>{categoryCount} active</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link>
      </nav>
      <nav className="settings-nav" aria-label="Transaction navigation"><Link className="settings-nav-card" href="/dashboard/transactions"><span className="setup-icon" aria-hidden="true">↕</span><span><strong>Transactions</strong><small>Record and review activity</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link><Link className="settings-nav-card" href="/dashboard/archives"><span className="setup-icon" aria-hidden="true">↶</span><span><strong>Archives</strong><small>View or restore archived records</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link></nav>
      <section className="balance-section"><div className="section-title-row"><div><p className="eyebrow">Current balances</p><h2>By account</h2></div><Link className="text-link" href="/dashboard/transactions/new">Add transaction</Link></div>
        {balances.length === 0 ? <p className="balance-empty">Create an account to see its balance here.</p> : <div className="balance-grid">{balances.map((account) => <article className="balance-card" key={account.id}><span>{account.name}</span><strong>{formatMinor(account.balanceMinor, account.currency)}</strong></article>)}</div>}
      </section>
      <section className="setup-panel" aria-labelledby="next-title">
        <div className="setup-icon" aria-hidden="true">↗</div>
        <div><p className="eyebrow">Stage 3</p><h2 id="next-title">Your transactions update balances</h2><p>Record income and expenses to keep each account balance current.</p></div>
        <Link className="setup-step nav-button" href="/dashboard/transactions/new">Add activity</Link>
      </section>
      <footer className="page-footer">Your financial information belongs to you.</footer>
    </main>
  );
}
