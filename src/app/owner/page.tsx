import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getOwnerWishes } from "@/services/wishes";

export default async function OwnerPage() {
  const user = await requireRole("shop_owner");
  const wishes = await getOwnerWishes(user.id);
  return (
    <DashboardShell role="shop_owner" eyebrow="SHOP OWNER DASHBOARD" title={`${user.profile.display_name}さんのWISH`} description="送信した内容は運営だけが確認します。Challenge化の前に、内容と公開範囲をご相談します。" actions={<ButtonLink href="/owner/wishes/new" variant="owner"><Plus className="size-4" /> 新しいWISH</ButtonLink>}>
      {wishes.length ? <div className="grid gap-4">{wishes.map((wish) => <article key={wish.id} className="rounded-3xl border border-line bg-white p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-black">{wish.shop_name}</h2><StatusPill status={wish.status} /></div><p className="mt-2 line-clamp-2 text-sm leading-7 text-muted">{wish.problem}</p><p className="mt-2 text-xs text-[#899391]">登録 {formatDate(wish.created_at)}</p></div><Link href={`/owner/wishes/${wish.id}`} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-owner">詳細 <ArrowRight className="size-4" /></Link></div></article>)}</div> : <EmptyState title="まだWISHがありません" body="地域で気になっていること、学生と試してみたいことを相談してください。" />}
    </DashboardShell>
  );
}
