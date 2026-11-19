import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-session";

export async function AccountSelect({ name = "accountId", selectedId }: { name?: string; selectedId?: string }) {
  const user = await requireUser();
  const accounts = await prisma.financeAccount.findMany({
    where: { ownerId: user.id, archivedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true, currency: true },
  });
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
