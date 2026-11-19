"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/form-field";
import { createAccount, updateAccount, type AccountActionState } from "@/features/accounts/actions";

type AccountFormValues = {
  id?: string;
  name?: string;
  type?: string;
  currency?: string;
  openingBalanceMinor?: number;
};

export function AccountForm({ account }: { account?: AccountFormValues }) {
  const action = account?.id ? updateAccount : createAccount;
  const [state, formAction, pending] = useActionState<AccountActionState, FormData>(action, {});

  return (
    <form action={formAction} className="settings-form">
      {account?.id ? <input type="hidden" name="id" value={account.id} /> : null}
      <FormField label="Account name" name="name" required maxLength={60} defaultValue={account?.name ?? ""} />
      <div className="form-field">
        <label className="form-label" htmlFor={`account-type-${account?.id ?? "new"}`}>Type</label>
        <select className="form-input" id={`account-type-${account?.id ?? "new"}`} name="type" defaultValue={account?.type ?? "CHECKING"}>
          <option value="CASH">Cash</option><option value="CHECKING">Checking</option><option value="SAVINGS">Savings</option>
          <option value="CREDIT_CARD">Credit card</option><option value="INVESTMENT">Investment</option><option value="OTHER">Other</option>
        </select>
      </div>
      <FormField label="Currency (3-letter code)" name="currency" required minLength={3} maxLength={3} defaultValue={account?.currency ?? "USD"} />
      <FormField label="Opening balance (minor units)" name="openingBalanceMinor" type="number" step="1" required defaultValue={String(account?.openingBalanceMinor ?? 0)} />
      <p className="field-hint">For USD, 12345 means $123.45. Use a negative amount for an opening debt.</p>
      {state.error ? <p className="form-message" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Saving…" : account?.id ? "Save account" : "Add account"}</button>
    </form>
  );
}
