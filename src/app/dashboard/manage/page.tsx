import Link from "next/link";
import { AccountForm } from "@/features/accounts/account-form";
import { ArchiveAccountButton } from "@/features/accounts/archive-account-button";
import { CategoryForm } from "@/features/categories/category-form";
import { ArchiveCategoryButton } from "@/features/categories/archive-category-button";
import { restoreAccount } from "@/features/accounts/actions";
import { restoreCategory } from "@/features/categories/actions";
import { requireUser } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

export default async function ManagePage() {
  const user = await requireUser();
  const [accounts, categories] = await Promise.all([
    prisma.financeAccount.findMany({ where: { ownerId: user.id }, orderBy: [{ archivedAt: "asc" }, { name: "asc" }] }),
    prisma.category.findMany({ where: { ownerId: user.id }, orderBy: [{ archivedAt: "asc" }, { name: "asc" }] }),
  ]);
  const activeAccounts = accounts.filter((account) => !account.archivedAt);
  const archivedAccounts = accounts.filter((account) => account.archivedAt);
  const activeCategories = categories.filter((category) => !category.archivedAt);
  const archivedCategories = categories.filter((category) => category.archivedAt);

  return <main className="dashboard-shell">
    <header className="dashboard-header"><Link className="brand-mark" href="/dashboard"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link><Link className="secondary-button nav-button" href="/dashboard">Dashboard</Link></header>
    <section className="settings-heading"><p className="eyebrow">One place to manage</p><h1>Accounts & categories</h1><p className="intro">Add, edit, archive, or restore the lists you use when recording transactions.</p></section>
    <nav className="manage-jumps" aria-label="Manage sections"><a href="#accounts">Accounts <span>{activeAccounts.length}</span></a><a href="#categories">Categories <span>{activeCategories.length}</span></a><a href="#archived">Archived <span>{archivedAccounts.length + archivedCategories.length}</span></a></nav>
    <section className="manage-grid">
      <section className="manage-section" id="accounts" aria-labelledby="accounts-title"><div className="manage-section-heading"><div><p className="eyebrow">Money locations</p><h2 id="accounts-title">Accounts</h2></div><span className="manage-count">{activeAccounts.length} active</span></div>
        <article className="settings-card manage-create"><h3>Add account</h3><AccountForm /></article>
        <div className="settings-list">{activeAccounts.length === 0 ? <div className="empty-state"><p>No active accounts yet.</p></div> : activeAccounts.map((account) => <article className="settings-card" key={account.id}><div className="settings-card-heading"><div><h3>{account.name}</h3><p className="record-meta">{account.type.replaceAll("_", " ").toLowerCase()} · {account.currency}</p></div><ArchiveAccountButton id={account.id}/></div><details className="edit-details"><summary>Edit</summary><AccountForm account={account}/></details></article>)}</div>
      </section>
      <section className="manage-section" id="categories" aria-labelledby="categories-title"><div className="manage-section-heading"><div><p className="eyebrow">Organize activity</p><h2 id="categories-title">Categories</h2></div><span className="manage-count">{activeCategories.length} active</span></div>
        <article className="settings-card manage-create"><h3>Add category</h3><CategoryForm /></article>
        <div className="settings-list">{activeCategories.length === 0 ? <div className="empty-state"><p>No active categories yet.</p></div> : activeCategories.map((category) => <article className="settings-card" key={category.id}><div className="settings-card-heading"><div><h3>{category.name}</h3><p className="record-meta">{category.type === "BOTH" ? "Income and expenses" : category.type.toLowerCase()}</p></div><ArchiveCategoryButton id={category.id}/></div><details className="edit-details"><summary>Edit</summary><CategoryForm category={category}/></details></article>)}</div>
      </section>
    </section>
    <section id="archived" className="manage-archives" aria-labelledby="archived-title"><div className="manage-section-heading"><div><p className="eyebrow">Keep history intact</p><h2 id="archived-title">Archived items</h2></div></div>
      <div className="archive-columns"><div><h3>Accounts</h3><div className="settings-list">{archivedAccounts.length ? archivedAccounts.map((account) => <article className="settings-card" key={account.id}><div className="settings-card-heading"><div><strong>{account.name}</strong><p className="record-meta">{account.currency} · Archived {account.archivedAt?.toLocaleDateString()}</p></div><form action={restoreAccount}><input type="hidden" name="id" value={account.id}/><button className="text-button restore-button">Restore</button></form></div></article>) : <p className="manage-empty">No archived accounts.</p>}</div></div>
        <div><h3>Categories</h3><div className="settings-list">{archivedCategories.length ? archivedCategories.map((category) => <article className="settings-card" key={category.id}><div className="settings-card-heading"><div><strong>{category.name}</strong><p className="record-meta">Archived {category.archivedAt?.toLocaleDateString()}</p></div><form action={restoreCategory}><input type="hidden" name="id" value={category.id}/><button className="text-button restore-button">Restore</button></form></div></article>) : <p className="manage-empty">No archived categories.</p>}</div></div></div>
    </section>
  </main>;
}
