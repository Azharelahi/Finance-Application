"use client";

import { deleteTransaction } from "@/features/transactions/actions";

export function DeleteTransactionButton({ id }: { id: string }) {
  return <form action={deleteTransaction} onSubmit={(event) => { if (!window.confirm("Permanently delete this transaction?")) event.preventDefault(); }}><input type="hidden" name="id" value={id} /><button className="text-button" type="submit">Delete transaction</button></form>;
}
