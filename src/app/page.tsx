import Link from "next/link";

const plannedFeatures = [
  "Accounts and categories",
  "Transactions and receipts",
  "Budgets, trends, and reports",
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <p className="eyebrow">Personal finance</p>
        <h1 id="welcome-title">Your money, in one clear view.</h1>
        <p className="intro">
          A simple place to understand what comes in, what goes out, and what
          you want to do next.
        </p>
        <div className="stage-note" role="status">
          <span className="status-dot" aria-hidden="true" />
          Create a private account or sign in to continue.
        </div>
        <div className="home-actions">
          <Link className="primary-button home-cta" href="/sign-up">Create an account</Link>
          <Link className="text-link" href="/sign-in">Sign in</Link>
        </div>
      </section>

      <section className="feature-section" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="eyebrow">The roadmap</p>
          <h2 id="features-title">Built around the way you manage money</h2>
        </div>
        <ul className="feature-list">
          {plannedFeatures.map((feature, index) => (
            <li className="feature-item" key={feature}>
              <span className="feature-number">0{index + 1}</span>
              <span>{feature}</span>
              <span className="feature-arrow" aria-hidden="true">
                ↗
              </span>
            </li>
          ))}
        </ul>
      </section>
      <footer className="page-footer">A thoughtful start to healthier money habits.</footer>
    </main>
  );
}
