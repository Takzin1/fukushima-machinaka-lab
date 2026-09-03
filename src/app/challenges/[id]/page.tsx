import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, Clock3, MapPin, Store, Users } from "lucide-react";
import { ApplicationForm } from "@/components/forms/application-form";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getUserContext } from "@/lib/auth/dal";
import { formatDate } from "@/lib/utils";
import { getPublishedChallenge } from "@/services/challenges";
import { demoChallenges } from "@/data/demo-challenges";
import { isFirebaseConfigured } from "@/lib/env";

// 静的書き出し（GitHub Pages）時は SAMPLE データの詳細ページだけを生成する。
export async function generateStaticParams() {
  if (isFirebaseConfigured()) return [];
  return demoChallenges.map((challenge) => ({ id: challenge.id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const challenge = await getPublishedChallenge(id);
  return challenge ? { title: challenge.title, description: challenge.summary } : { title: "Challengeが見つかりません" };
}

async function ChallengeDetailContent({ params }: Props) {
  const { id } = await params;
  const [challenge, user] = await Promise.all([getPublishedChallenge(id), getUserContext()]);
  if (!challenge) notFound();
  return (
    <>
      <section className="border-b border-line bg-white py-14 sm:py-20"><Container className="max-w-5xl"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-student-soft px-3 py-1 text-xs font-bold text-student">{challenge.category}</span>{challenge.is_sample ? <span className="rounded-full border border-[#e3c08a] bg-[#fff8e7] px-3 py-1 text-xs font-bold text-[#91611c]">DEMO / SAMPLE DATA</span> : null}</div><h1 className="balance mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">{challenge.title}</h1><p className="mt-6 max-w-3xl text-lg leading-9 text-muted">{challenge.summary}</p></Container></section>
      <section className="py-12 sm:py-16"><Container className="grid max-w-5xl gap-8 lg:grid-cols-[1fr_310px]">
        <article className="grid gap-9 rounded-3xl border border-line bg-white p-6 sm:p-9">
          {[{ title: "背景", body: challenge.background }, { title: "解決したい課題", body: challenge.problem }, { title: "期待する成果", body: challenge.desired_outcome }].map((section) => <section key={section.title}><p className="text-xs font-black tracking-[0.18em] text-student">{section.title}</p><p className="mt-3 whitespace-pre-wrap leading-8 text-[#465458]">{section.body}</p></section>)}
          <section><p className="text-xs font-black tracking-[0.18em] text-student">必要・歓迎スキル</p><div className="mt-4 flex flex-wrap gap-2">{challenge.skills.length ? challenge.skills.map((skill) => <span key={skill} className="rounded-xl bg-[#f1f4f3] px-3 py-2 text-sm font-bold">{skill}</span>) : <span className="text-sm text-muted">特定のスキルは問いません</span>}</div></section>
        </article>
        <aside><div className="sticky top-24 rounded-3xl bg-admin p-6 text-white"><p className="text-xs font-black tracking-[0.16em] text-[#aebdb9]">FIELD INFO</p><dl className="mt-6 grid gap-4 text-sm"><div className="flex gap-3"><Store className="mt-0.5 size-4 shrink-0 text-[#ffc49d]" /><div><dt className="text-xs text-[#aebdb9]">対象</dt><dd className="mt-1 font-bold">{challenge.shop_display_name}</dd></div></div><div className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[#ffc49d]" /><div><dt className="text-xs text-[#aebdb9]">活動地域</dt><dd className="mt-1 font-bold">{challenge.area}</dd></div></div><div className="flex gap-3"><Clock3 className="mt-0.5 size-4 shrink-0 text-[#ffc49d]" /><div><dt className="text-xs text-[#aebdb9]">期間・活動量</dt><dd className="mt-1 font-bold">{challenge.period ?? "応相談"} / {challenge.workload ?? "応相談"}</dd></div></div><div className="flex gap-3"><Users className="mt-0.5 size-4 shrink-0 text-[#ffc49d]" /><div><dt className="text-xs text-[#aebdb9]">募集人数</dt><dd className="mt-1 font-bold">{challenge.capacity}名</dd></div></div><div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-[#ffc49d]" /><div><dt className="text-xs text-[#aebdb9]">応募締切</dt><dd className="mt-1 font-bold">{formatDate(challenge.deadline)}</dd></div></div></dl></div></aside>
      </Container></section>
      <section id="apply" className="border-t border-line bg-white py-14 sm:py-20"><Container className="max-w-3xl"><p className="text-xs font-black tracking-[0.2em] text-student">APPLY</p><h2 className="mt-3 text-3xl font-black">このChallengeに応募する</h2><p className="mt-4 leading-8 text-muted">応募内容はまず運営が確認します。商店主へ個人情報が自動公開されることはありません。</p><div className="mt-8 rounded-3xl border border-line bg-background p-5 sm:p-8">{user?.profile.role === "student" ? <ApplicationForm challengeId={challenge.id} /> : user ? <p className="text-sm leading-7 text-muted">学生アカウントのみ応募できます。現在のアカウントではChallengeの閲覧のみ可能です。</p> : <div className="text-center"><p className="text-sm leading-7 text-muted">応募には学生アカウントでのログインが必要です。</p><div className="mt-5 flex justify-center gap-3"><ButtonLink href="/login" variant="outline">ログイン</ButtonLink><ButtonLink href="/register" variant="student">学生登録する</ButtonLink></div></div>}</div></Container></section>
    </>
  );
}

export default function ChallengeDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-label="読み込み中" />}>
      <ChallengeDetailContent params={params} />
    </Suspense>
  );
}
