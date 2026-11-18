import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ eyebrow, title, description, children, footer }: AuthCardProps) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link className="brand-mark" href="/" aria-label="Finance App home">
          <span className="brand-icon" aria-hidden="true">F</span>
          <span>Finance App</span>
        </Link>
        <p className="eyebrow auth-eyebrow">{eyebrow}</p>
        <h1 className="auth-title" id="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </section>
      <p className="auth-privacy">Your financial information is private to your account.</p>
    </main>
  );
}
