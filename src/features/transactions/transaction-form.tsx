"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useActionState, useState, type ChangeEvent } from "react";
import { FormField } from "@/components/forms/form-field";
import { createTransaction, updateTransaction, type TransactionActionState } from "@/features/transactions/actions";
import { formatCalendarDate } from "@/lib/dates/calendar";
import { minorToMajorInput } from "@/lib/money/format";
import { transactionSchema } from "@/lib/validation/transaction";

type CategoryOption = { id: string; name: string; type: "INCOME" | "EXPENSE" | "BOTH"; archived: boolean };

type TransactionFormValues = {
  id: string; accountId: string; categoryId: string | null; amountMinor: number;
  currency: string; type: "INCOME" | "EXPENSE"; occurredAt: Date; description: string;
};

export function TransactionForm({ transaction, accountSelect, categories }: { transaction?: TransactionFormValues; accountSelect: ReactNode; categories: CategoryOption[] }) {
  const action = transaction ? updateTransaction : createTransaction;
  const [state, formAction, pending] = useActionState<TransactionActionState, FormData>(action, {});
  const [clientError, setClientError] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">(transaction?.type ?? "EXPENSE");
  const initialCategoryCompatible = !transaction?.categoryId || categories.some((category) => category.id === transaction.categoryId && (category.type === "BOTH" || category.type === (transaction.type ?? "EXPENSE")));
  const [categoryId, setCategoryId] = useState(initialCategoryCompatible ? transaction?.categoryId ?? "" : "");
  const [categoryNotice, setCategoryNotice] = useState(!initialCategoryCompatible);
  const compatibleCategories = categories.filter((category) => category.type === "BOTH" || category.type === type);
  const unavailableCategories = categories.filter((category) => category.type !== "BOTH" && category.type !== type);
  const onTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.currentTarget.value as "INCOME" | "EXPENSE";
    setType(nextType);
    if (categoryId && !categories.some((category) => category.id === categoryId && (category.type === "BOTH" || category.type === nextType))) {
      setCategoryId("");
      setCategoryNotice(true);
    }
  };
  return (
    <form action={formAction} className="settings-form" onSubmit={(event) => {
      const data = new FormData(event.currentTarget);
      const parsed = transactionSchema.safeParse({
        accountId: data.get("accountId"), categoryId: data.get("categoryId") || undefined,
        amount: data.get("amount"), type: data.get("type"), occurredAt: data.get("occurredAt"), description: data.get("description"),
      });
      if (!parsed.success) {
        event.preventDefault();
        setClientError(parsed.error.issues[0]?.message ?? "Check the transaction details.");
      } else setClientError("");
    }}>
      {transaction ? <input type="hidden" name="id" value={transaction.id} /> : null}
      {accountSelect}
      <div className="form-field">
        <label className="form-label" htmlFor="transaction-type">Type</label>
        <select className="form-input" id="transaction-type" name="type" value={type} onChange={onTypeChange}>
          <option value="EXPENSE">Expense</option><option value="INCOME">Income</option>
        </select>
      </div>
      <FormField label={`Amount${transaction ? ` (${transaction.currency})` : " (currency shown with account)"}`} name="amount" type="number" min="0.01" step="any" required defaultValue={transaction ? minorToMajorInput(transaction.amountMinor, transaction.currency) : ""} />
      <div className="form-field">
        <label className="form-label" htmlFor="categoryId">Category <span className="optional-label">(optional)</span></label>
        <select className="form-input" id="categoryId" name="categoryId" value={categoryId} onChange={(event) => { setCategoryId(event.currentTarget.value); setCategoryNotice(false); }}>
          <option value="">No category</option>
          {compatibleCategories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.archived ? " · archived" : ""}</option>)}
          {unavailableCategories.length > 0 ? <optgroup label={`Not available for ${type.toLowerCase()}`}>
            {unavailableCategories.map((category) => <option key={category.id} value={category.id} disabled>{category.name} — {category.type === "EXPENSE" ? "expenses only" : "income only"}{category.archived ? " · archived" : ""}</option>)}
          </optgroup> : null}
        </select>
        {compatibleCategories.length === 0
          ? <p className="field-hint">No categories are set up for {type.toLowerCase()} yet. {unavailableCategories.length > 0 ? "The disabled options above only apply to the other transaction type. " : ""}<Link href="/dashboard/categories">Add one or change a category to “Income and expenses”.</Link></p>
          : categoryNotice
            ? <p className="field-hint">That category doesn’t apply to {type.toLowerCase()}, so it was cleared. Choose a compatible category or update it in <Link href="/dashboard/categories">category settings</Link>.</p>
            : <p className="field-hint">Choose a category that applies to {type.toLowerCase()}, or leave this blank. {unavailableCategories.length > 0 ? <>{unavailableCategories.map((category) => category.name).join(", ")} {unavailableCategories.length === 1 ? "only applies" : "only apply"} to the other transaction type. <Link href="/dashboard/categories">Change category settings</Link>.</> : null}</p>}
      </div>
      <FormField label="Date" name="occurredAt" type="date" required defaultValue={transaction ? formatCalendarDate(transaction.occurredAt) : formatCalendarDate(new Date())} />
      <FormField label="Description" name="description" maxLength={240} required defaultValue={transaction?.description ?? ""} />
      {clientError || state.error ? <p className="form-message" role="alert">{clientError || state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Saving…" : transaction ? "Save transaction" : "Record transaction"}</button>
      {transaction ? <Link className="text-link" href={`/dashboard/transactions/${transaction.id}`}>Cancel</Link> : null}
    </form>
  );
}
