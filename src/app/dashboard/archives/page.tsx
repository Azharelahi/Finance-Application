import Link from "next/link";
import { requireUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import { restoreAccount } from "@/features/accounts/actions";
import { restoreCategory } from "@/features/categories/actions";

export default async function ArchivesPage() {
  const user = await requireUser();
  const [accounts, categories] = await Promise.all([
    prisma.financeAccount.findMany({ where: { ownerId: user.id, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
    prisma.category.findMany({ where: { ownerId: user.id, archivedAt: { not: null } }, orderBy: { archivedAt: "desc" } }),
  ]);
  return <main className="dashboard-shell">
    <header className="dashboard-header"><Link className="brand-mark" href="/dashboard"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link><Link className="secondary-button nav-button" href="/dashboard">Dashboard</Link></header>
    <section className="settings-heading"><p className="eyebrow">Your records</p><h1>Archives</h1><p className="intro">Archived accounts and categories stay here. Restore one to make it available again.</p></section>
    <section className="archive-columns">
      <div><h2>Accounts</h2><div className="settings-list">{accounts.length ? accounts.map(a => <article className="settings-card" key={a.id}><div className="settings-card-heading"><h3>{a.name}</h3><form action={restoreAccount}><input type="hidden" name="id" value={a.id} /><button className="text-button restore-button">Restore</button></form></div><p className="record-meta">{a.type.replaceAll("_", " ").toLowerCase()} · {a.currency} · Archived {a.archivedAt?.toLocaleDateString()}</p></article>) : <div className="empty-state"><h2>No archived accounts</h2><p>Accounts you archive will appear here.</p></div>}</div></div>
      <div><h2>Categories</h2><div className="settings-list">{categories.length ? categories.map(c => <article className="settings-card" key={c.id}><div className="settings-card-heading"><h3>{c.name}</h3><form action={restoreCategory}><input type="hidden" name="id" value={c.id} /><button className="text-button restore-button">Restore</button></form></div><p className="record-meta">{c.type === "BOTH" ? "income and expenses" : c.type.toLowerCase()} · Archived {c.archivedAt?.toLocaleDateString()}</p></article>) : <div className="empty-state"><h2>No archived categories</h2><p>Categories you archive will appear here.</p></div>}</div></div>
    </section>
  </main>;
}
