import Link from "next/link";
import { CategoryForm } from "@/features/categories/category-form";
import { ArchiveCategoryButton } from "@/features/categories/archive-category-button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-session";

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await prisma.category.findMany({ where: { ownerId: user.id, archivedAt: null }, orderBy: { name: "asc" } });
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand-mark" href="/dashboard"><span className="brand-icon" aria-hidden="true">F</span><span>Finance App</span></Link>
        <Link className="secondary-button nav-button" href="/dashboard">Dashboard</Link>
      </header>
      <section className="settings-heading"><p className="eyebrow">Settings · categories</p><h1>Your categories</h1><p className="intro">Create categories for income, expenses, or both. Names are unique per user, without regard to capitalization.</p></section>
      <section className="settings-grid">
        <article className="settings-card"><h2>Add a category</h2><CategoryForm /></article>
        <div className="settings-list" aria-label="Your categories">
          {categories.length === 0 ? <div className="empty-state"><h2>No categories yet</h2><p>Add categories to keep future transactions organized.</p></div> : categories.map((category) => (
            <article className="settings-card" key={category.id}>
              <div className="settings-card-heading"><h2>{category.name}</h2><ArchiveCategoryButton id={category.id} /></div>
              <p className="record-meta">{category.type === "BOTH" ? "income and expenses" : category.type.toLowerCase()}</p>
              <details className="edit-details"><summary>Edit category</summary><CategoryForm category={category} /></details>
            </article>
          ))}
        </div>
      </section>
      <footer className="page-footer">Archived categories are hidden and their names remain reserved.</footer>
    </main>
  );
}
