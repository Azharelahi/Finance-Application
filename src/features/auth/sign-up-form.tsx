"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/forms/form-field";

export function SignUpForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = signUpSchema.safeParse(values);

    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }

    setBusy(true);
    const { error } = await authClient.signUp.email({
      ...parsed.data,
      callbackURL: "/dashboard",
    });
    setBusy(false);

    if (error) {
      setMessage("We could not create your account with those details. Check that the email is available and try again.");
      return;
    }
    window.location.assign("/dashboard");
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormField label="Your name" name="name" autoComplete="name" required maxLength={80} error={errors.name} />
      <FormField label="Email address" name="email" type="email" autoComplete="email" required maxLength={254} error={errors.email} />
      <FormField label="Password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} error={errors.password} />
      <p className="field-hint">Use 12 or more characters. A longer passphrase is easier to remember.</p>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <button className="primary-button" type="submit" disabled={busy}>
        {busy ? "Creating account…" : "Create account"}
      </button>
      <p className="form-terms">By continuing, you agree to use your account responsibly and keep your sign-in details private.</p>
      <p className="form-switch">Already have an account? <Link href="/sign-in">Sign in</Link></p>
    </form>
  );
}
