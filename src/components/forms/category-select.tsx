import { requireUser } from "@/lib/auth-session";
import { listCategoryOptions } from "@/features/categories/queries";

export async function CategorySelect({ name = "categoryId", selectedId, type }: { name?: string; selectedId?: string; type?: "INCOME" | "EXPENSE" }) {
  const user = await requireUser();
  const categories = await listCategoryOptions(user.id, type);
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={name}>Category</label>
      <select className="form-input" id={name} name={name} defaultValue={selectedId ?? ""}>
        <option value="">No category</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      {categories.length === 0 ? <p className="field-hint">Add a category to organize transactions.</p> : null}
    </div>
  );
}
