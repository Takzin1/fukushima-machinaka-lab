import { ArrowRight } from "lucide-react";
import { ChallengeCard } from "@/components/challenge-card";
import { DashboardShell } from "@/components/dashboard-shell";
import { ButtonLink } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/dal";
import { getPublishedChallenges } from "@/services/challenges";

export default async function StudentPage() {
  const user = await requireRole("student");
  const challenges = await getPublishedChallenges();
  return <DashboardShell role="student" eyebrow="STUDENT DASHBOARD" title={`こんにちは、${user.profile.display_name}さん`} description="興味を持ったChallengeを、自分の言葉で選んでください。応募内容はまず運営が確認します。" actions={<ButtonLink href="/student/applications" variant="outline">応募履歴 <ArrowRight className="size-4" /></ButtonLink>}><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black tracking-[0.18em] text-student">RECOMMENDED</p><h2 className="mt-2 text-2xl font-black">公開中のChallenge</h2></div><ButtonLink href="/challenges" variant="ghost">すべて見る</ButtonLink></div><div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{challenges.slice(0, 3).map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div></DashboardShell>;
}
