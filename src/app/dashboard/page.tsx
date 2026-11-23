import Link from "next/link";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { requireUser } from "@/lib/auth-session";
import { countActiveAccounts } from "@/features/accounts/queries";
import { countActiveCategories } from "@/features/categories/queries";

export default async function DashboardPage() {
  const user = await requireUser();
  const [accountCount, categoryCount] = await Promise.all([
    countActiveAccounts(user.id),
    countActiveCategories(user.id),
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
        <p className="intro">Your private finance workspace is ready. Set up your accounts and categories to prepare for transactions.</p>
        <div className="dashboard-status"><span className="status-dot" aria-hidden="true" /><span>Signed in as {user.email}</span></div>
      </section>
      <nav className="settings-nav" aria-label="Finance settings">
        <Link className="settings-nav-card" href="/dashboard/accounts"><span className="setup-icon" aria-hidden="true">$</span><span><strong>Accounts</strong><small>{accountCount} active</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link>
        <Link className="settings-nav-card" href="/dashboard/categories"><span className="setup-icon" aria-hidden="true">✦</span><span><strong>Categories</strong><small>{categoryCount} active</small></span><span className="nav-arrow" aria-hidden="true">→</span></Link>
      </nav>
      <section className="setup-panel" aria-labelledby="next-title">
        <div className="setup-icon" aria-hidden="true">↗</div>
        <div><p className="eyebrow">Next stage</p><h2 id="next-title">Record transactions</h2><p>Your accounts and categories are ready for the next stage.</p></div>
        <span className="setup-step">Stage 3</span>
      </section>
      <footer className="page-footer">Your financial information belongs to you.</footer>
    </main>
  );
}
