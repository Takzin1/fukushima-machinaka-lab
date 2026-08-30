import { ArrowRight, ClipboardList, FileQuestion, Handshake } from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth/dal";
import { getAllApplications } from "@/services/applications";
import { getAllChallenges } from "@/services/challenges";
import { getAllWishes } from "@/services/wishes";

export default async function AdminPage() {
  await requireRole("admin");
  const [wishes, challenges, applications] = await Promise.all([getAllWishes(), getAllChallenges(), getAllApplications()]);
  const cards = [
    { href: "/admin/wishes", label: "WISH", value: wishes.length, note: `${wishes.filter((item) => item.status === "submitted").length}件が未確認`, icon: FileQuestion },
    { href: "/admin/challenges", label: "CHALLENGE", value: challenges.length, note: `${challenges.filter((item) => item.status === "published").length}件を公開中`, icon: ClipboardList },
    { href: "/admin/applications", label: "APPLICATION", value: applications.length, note: `${applications.filter((item) => item.status === "applied").length}件が新着`, icon: Handshake },
  ];
  return <DashboardShell role="admin" eyebrow="LAB OPERATOR" title="管理ダッシュボード" description="WISHを安全にChallengeへ変換し、学生応募を確認してKNOTへ進めます。"><div className="grid gap-5 md:grid-cols-3">{cards.map(({ href, label, value, note, icon: Icon }) => <Link key={href} href={href} className="group rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#acb8b4]"><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-2xl bg-[#e9eeec] text-admin"><Icon className="size-5" /></div><ArrowRight className="size-4 text-muted transition group-hover:translate-x-1" /></div><p className="mt-8 text-xs font-black tracking-[0.18em] text-muted">{label}</p><p className="mt-2 text-4xl font-black">{value}</p><p className="mt-3 text-sm text-muted">{note}</p></Link>)}</div></DashboardShell>;
}
