import { archiveAccount } from "@/features/accounts/actions";

export function ArchiveAccountButton({ id }: { id: string }) {
  return <form action={archiveAccount}><input type="hidden" name="id" value={id} /><button className="text-button" type="submit">Archive</button></form>;
}
