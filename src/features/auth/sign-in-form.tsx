"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/forms/form-field";

export function SignInForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setMessage("");
    const parsed = signInSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }

    setBusy(true);
    const { error } = await authClient.signIn.email({ ...parsed.data, callbackURL: "/dashboard" });
    setBusy(false);
    if (error) {
      setMessage("The email or password was not recognized. Please try again.");
      return;
    }
    window.location.assign("/dashboard");
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Email address" name="email" type="email" autoComplete="email" required maxLength={254} error={errors.email} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" required maxLength={128} error={errors.password} />
      <div className="form-inline-link"><Link href="/forgot-password">Forgot password?</Link></div>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="form-switch">New here? <Link href="/sign-up">Create an account</Link></p>
    </form>
  );
}
