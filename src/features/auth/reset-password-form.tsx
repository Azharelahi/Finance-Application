"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { FormField } from "@/components/forms/form-field";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setMessage("");
    if (!token) {
      setMessage("This reset link is missing or invalid. Request a new one to continue.");
      return;
    }
    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }

    setBusy(true);
    const { error } = await authClient.resetPassword({ newPassword: parsed.data.password, token });
    setBusy(false);
    if (error) {
      setMessage("This reset link may have expired or already been used. Request a new one to continue.");
      return;
    }
    setComplete(true);
  }

  if (complete) {
    return (
      <div className="success-panel" role="status">
        <span className="success-icon" aria-hidden="true">✓</span>
        <p>Your password has been updated. Sign in with your new password.</p>
        <Link href="/sign-in">Continue to sign in</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormField label="New password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} error={errors.password} />
      <FormField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} error={errors.confirmPassword} />
      {!token ? <p className="form-message" role="alert">This reset link is missing or invalid.</p> : null}
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <button className="primary-button" type="submit" disabled={busy || !token}>
        {busy ? "Updating password…" : "Update password"}
      </button>
    </form>
  );
}
