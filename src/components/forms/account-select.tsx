import { requireUser } from "@/lib/auth-session";
import { listAccountOptions } from "@/features/accounts/queries";

export async function AccountSelect({ name = "accountId", selectedId }: { name?: string; selectedId?: string }) {
  const user = await requireUser();
  const accounts = await listAccountOptions(user.id);
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={name}>Account</label>
      <select className="form-input" id={name} name={name} defaultValue={selectedId ?? ""} required>
        <option value="" disabled>Select an account</option>
        {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}
      </select>
      {accounts.length === 0 ? <p className="field-hint">Add an account before recording transactions.</p> : null}
    </div>
  );
}
