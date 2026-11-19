import Link from "next/link";
import { AccountForm } from "@/features/accounts/account-form";
import { ArchiveAccountButton } from "@/features/accounts/archive-account-button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-session";

export default async function AccountsPage() {
  const user = await requireUser();
  const accounts = await prisma.financeAccount.findMany({ where: { ownerId: user.id, archivedAt: null }, orderBy: { name: "asc" } });
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand-mark" href="/dashboard"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link>
        <Link className="secondary-button nav-button" href="/dashboard">Dashboard</Link>
      </header>
      <section className="settings-heading"><p className="eyebrow">Settings · accounts</p><h1>Your accounts</h1><p className="intro">Add the places where your money lives. Names are unique per user, without regard to capitalization.</p></section>
      <section className="settings-grid">
        <article className="settings-card"><h2>Add an account</h2><AccountForm /></article>
        <div className="settings-list" aria-label="Your accounts">
          {accounts.length === 0 ? <div className="empty-state"><h2>No accounts yet</h2><p>Create an account to start organizing your finances.</p></div> : accounts.map((account) => (
            <article className="settings-card" key={account.id}>
              <div className="settings-card-heading"><h2>{account.name}</h2><ArchiveAccountButton id={account.id} /></div>
              <p className="record-meta">{account.type.replaceAll("_", " ").toLowerCase()} · {account.currency} · opening balance {account.openingBalanceMinor} minor units</p>
              <details className="edit-details"><summary>Edit account</summary><AccountForm account={account} /></details>
            </article>
          ))}
        </div>
      </section>
      <footer className="page-footer">Archived accounts are hidden and their names remain reserved.</footer>
    </main>
  );
}
