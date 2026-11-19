import { archiveCategory } from "@/features/categories/actions";

export function ArchiveCategoryButton({ id }: { id: string }) {
  return <form action={archiveCategory}><input type="hidden" name="id" value={id} /><button className="text-button" type="submit">Archive</button></form>;
}
