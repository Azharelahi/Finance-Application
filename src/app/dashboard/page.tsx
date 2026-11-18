import { SignOutButton } from "@/features/auth/sign-out-button";
import { requireUser } from "@/lib/auth-session";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <Link className="brand-mark" href="/" aria-label="Finance App home">
          <span className="brand-icon" aria-hidden="true">F</span>
          <span>Finance App</span>
        </Link>
        <SignOutButton />
      </header>
      <section className="dashboard-welcome">
        <p className="eyebrow">Your dashboard</p>
        <h1>Welcome, {user.name.split(" ")[0]}.</h1>
        <p className="intro">Your private finance workspace is ready. We’ll build your accounts and categories here next.</p>
        <div className="dashboard-status">
          <span className="status-dot" aria-hidden="true" />
          <span>Signed in as {user.email}</span>
        </div>
      </section>
      <section className="setup-panel" aria-labelledby="next-title">
        <div className="setup-icon" aria-hidden="true">✦</div>
        <div>
          <p className="eyebrow">Coming up</p>
          <h2 id="next-title">Set up your accounts</h2>
          <p>Connect the places where your money lives, then start recording transactions.</p>
        </div>
        <span className="setup-step">Stage 2</span>
      </section>
      <footer className="page-footer">Your financial information belongs to you.</footer>
    </main>
  );
}
