"use client";

import { useActionState } from "react";
import { FormField } from "@/components/forms/form-field";
import { createCategory, updateCategory, type CategoryActionState } from "@/features/categories/actions";

type CategoryFormValues = { id?: string; name?: string; type?: string };

export function CategoryForm({ category }: { category?: CategoryFormValues }) {
  const action = category?.id ? updateCategory : createCategory;
  const [state, formAction, pending] = useActionState<CategoryActionState, FormData>(action, {});

  return (
    <form action={formAction} className="settings-form">
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <FormField label="Category name" name="name" required maxLength={60} defaultValue={category?.name ?? ""} />
      <div className="form-field">
        <label className="form-label" htmlFor={`category-type-${category?.id ?? "new"}`}>Applies to</label>
        <select className="form-input" id={`category-type-${category?.id ?? "new"}`} name="type" defaultValue={category?.type ?? "BOTH"}>
          <option value="EXPENSE">Expenses</option><option value="INCOME">Income</option><option value="BOTH">Income and expenses</option>
        </select>
      </div>
      {state.error ? <p className="form-message" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-success" role="status">{state.success}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>{pending ? "Saving…" : category?.id ? "Save category" : "Add category"}</button>
    </form>
  );
}
