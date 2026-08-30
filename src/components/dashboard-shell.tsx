import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";
import { Container } from "@/components/ui/container";

const nav = {
  shop_owner: [{ href: "/owner", label: "WISH一覧" }, { href: "/owner/wishes/new", label: "新しいWISH" }],
  student: [{ href: "/student", label: "学生ホーム" }, { href: "/student/applications", label: "応募履歴" }, { href: "/challenges", label: "Challengeを探す" }],
  admin: [{ href: "/admin", label: "管理ホーム" }, { href: "/admin/wishes", label: "WISH" }, { href: "/admin/challenges", label: "Challenge" }, { href: "/admin/applications", label: "応募" }],
};

export function DashboardShell({ role, eyebrow, title, description, children, actions }: { role: UserRole; eyebrow: string; title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <>
      <div className={cn("border-b border-line", role === "shop_owner" ? "bg-owner-soft" : role === "student" ? "bg-student-soft" : "bg-[#e8eceb]") }>
        <Container className="py-10 sm:py-12"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className={cn("text-xs font-black tracking-[0.2em]", role === "shop_owner" ? "text-owner" : role === "student" ? "text-student" : "text-admin")}>{eyebrow}</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>{description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{description}</p> : null}</div>{actions}</div><nav className="mt-8 flex gap-2 overflow-x-auto pb-1" aria-label="ダッシュボードナビゲーション">{nav[role].map((item) => <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full border border-[#cdd5d2] bg-white px-4 py-2 text-xs font-bold hover:border-[#99a7a3]">{item.label}</Link>)}</nav></Container>
      </div>
      <section className="py-10 sm:py-14"><Container>{children}</Container></section>
    </>
  );
}
