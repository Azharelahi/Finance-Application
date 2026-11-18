"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { emailSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/forms/form-field";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = emailSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setBusy(true);
    await authClient.requestPasswordReset({
      email: parsed.data.email,
      redirectTo: "/reset-password",
    });
    setBusy(false);
    // Keep the response the same whether or not the email belongs to an account.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="success-panel" role="status">
        <span className="success-icon" aria-hidden="true">✓</span>
        <p>If an account matches that email, a password reset link is on its way. Check your inbox.</p>
        <Link href="/sign-in">Return to sign in</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Email address" name="email" type="email" autoComplete="email" required maxLength={254} error={error} />
      <p className="field-hint">We’ll send a time-limited reset link if an account matches.</p>
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send reset link"}
      </button>
      <p className="form-switch"><Link href="/sign-in">Back to sign in</Link></p>
    </form>
  );
}
