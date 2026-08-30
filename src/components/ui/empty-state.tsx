import { Inbox } from "lucide-react";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#bcc6c3] bg-white px-6 py-14 text-center">
      <Inbox className="mx-auto mb-4 size-8 text-[#899593]" aria-hidden="true" />
      <h2 className="font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted">{body}</p>
    </div>
  );
}
