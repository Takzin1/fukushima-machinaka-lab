import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { requireRole } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getAllWishes } from "@/services/wishes";

export default async function AdminWishesPage() {
  await requireRole("admin");
  const wishes = await getAllWishes();
  return <DashboardShell role="admin" eyebrow="WISH REVIEW" title="WISH一覧" description="連絡先・住所を含むため、この画面の情報を公開ページへそのまま転載しないでください。">{wishes.length ? <div className="overflow-hidden rounded-3xl border border-line bg-white"><div className="hidden grid-cols-[1fr_160px_130px_80px] border-b border-line bg-[#f3f5f4] px-6 py-3 text-xs font-black text-muted md:grid"><span>店舗・内容</span><span>登録日</span><span>状態</span><span /></div>{wishes.map((wish) => <div key={wish.id} className="grid gap-4 border-b border-line px-5 py-5 last:border-0 md:grid-cols-[1fr_160px_130px_80px] md:items-center md:px-6"><div><p className="font-black">{wish.shop_name}</p><p className="mt-1 line-clamp-1 text-sm text-muted">{wish.problem}</p></div><span className="text-sm text-muted">{formatDate(wish.created_at)}</span><div><StatusPill status={wish.status} /></div><Link href={`/admin/wishes/${wish.id}`} className="inline-flex items-center gap-1 text-sm font-bold">確認 <ArrowRight className="size-4" /></Link></div>)}</div> : <EmptyState title="WISHはまだありません" body="商店主から送信されたWISHがここに表示されます。" />}</DashboardShell>;
}
