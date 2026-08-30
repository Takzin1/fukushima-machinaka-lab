import {
  ArrowDown,
  ArrowRight,
  Building2,
  Lightbulb,
  Link2,
  MousePointerClick,
  Sparkles,
  Users,
} from "lucide-react";
import { ChallengeCard } from "@/components/challenge-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getPublishedChallenges } from "@/services/challenges";

const flow = [
  { number: "01", label: "SHOP OWNER", title: "困りごと・やりたいこと", icon: Building2, color: "owner" },
  { number: "02", label: "WISH", title: "運営が聞き取り", icon: Lightbulb, color: "owner" },
  { number: "03", label: "CHALLENGE", title: "学生向け課題へ編集", icon: Sparkles, color: "student" },
  { number: "04", label: "PULL", title: "学生自身が選ぶ", icon: MousePointerClick, color: "student" },
  { number: "05", label: "KNOT", title: "商店主 × 学生をつなぐ", icon: Link2, color: "admin" },
] as const;

export default async function HomePage() {
  const challenges = await getPublishedChallenges();
  return (
    <>
      <section className="paper-grid overflow-hidden border-b border-line bg-[#fbfaf7]">
        <Container className="relative grid min-h-[650px] items-center gap-10 py-20 lg:grid-cols-[1.15fr_.85fr] lg:py-28">
          <div className="absolute -right-24 top-20 size-72 rounded-full bg-owner-soft blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9dfdc] bg-white px-4 py-2 text-xs font-bold tracking-wide text-[#4f5d60]">
              <span className="size-2 rounded-full bg-owner" /> FUKUSHIMA CITY · CO-CREATION LAB
            </div>
            <h1 className="balance mt-7 text-[clamp(2.6rem,7vw,5.9rem)] font-black leading-[1.02] tracking-[-0.055em]">
              商店主の<span className="text-owner">WISH</span>から、<br />学生の<span className="text-student">Challenge</span>をつくる。
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-muted sm:text-lg">
              地域の「やりたい・困った」を、学生との小さな実験に変える共創LAB。
              福島駅前を、地域と学生が一緒に試せる“まちなかキャンパス”へ。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/owner/wishes/new" variant="owner" className="min-h-14 px-7 text-base">WISHを相談する <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
              <ButtonLink href="/challenges" variant="student" className="min-h-14 px-7 text-base">Challengeを見る <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="rotate-2 rounded-[2rem] border border-[#1e2a2e] bg-admin p-7 text-white shadow-[18px_18px_0_#dceee5] sm:p-9">
              <p className="text-xs font-black tracking-[0.22em] text-[#b9c7c3]">FIELD NOTE / 001</p>
              <p className="mt-8 text-3xl font-black leading-tight">街の課題は、<br />誰かの教材ではなく、<br /><span className="text-[#ffc49d]">一緒に試すテーマ</span>になる。</p>
              <div className="mt-10 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4"><Building2 className="mb-3 size-5 text-[#ffc49d]" /><strong>地域の当事者</strong><p className="mt-1 text-xs text-[#cbd5d2]">WISHを言葉にする</p></div>
                <div className="rounded-2xl bg-white/10 p-4"><Users className="mb-3 size-5 text-[#99bcff]" /><strong>学生の挑戦</strong><p className="mt-1 text-xs text-[#cbd5d2]">自分でテーマを選ぶ</p></div>
              </div>
            </div>
          </div>
          <a href="#flow" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold text-muted lg:flex">HOW IT WORKS <ArrowDown className="size-4" aria-hidden="true" /></a>
        </Container>
      </section>

      <section id="flow" className="py-20 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-black tracking-[0.22em] text-owner">WISH → KNOT</p>
            <h2 className="balance mt-4 text-3xl font-black tracking-tight sm:text-5xl">相談を、学生が選べる<br />Challengeへ変換する。</h2>
            <p className="mt-5 leading-8 text-muted">WISHをそのまま公開しません。運営が話を聞き、個人情報を守りながら、小さく試せる問いへ編集します。</p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {flow.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="relative rounded-3xl border border-line bg-white p-5">
                  <div className={`grid size-11 place-items-center rounded-2xl ${item.color === "owner" ? "bg-owner-soft text-owner" : item.color === "student" ? "bg-student-soft text-student" : "bg-admin text-white"}`}><Icon className="size-5" aria-hidden="true" /></div>
                  <p className="mt-7 text-[10px] font-black tracking-[0.18em] text-muted">{item.number} · {item.label}</p>
                  <p className="mt-2 text-sm font-bold leading-6">{item.title}</p>
                  {index < flow.length - 1 ? <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 rounded-full bg-background text-[#9aa6a3] md:block" aria-hidden="true" /> : null}
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      <section className="border-y border-line bg-white py-20 sm:py-28">
        <Container>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black tracking-[0.22em] text-student">OPEN CHALLENGES</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">街で、何を試す？</h2></div>
            <ButtonLink href="/challenges" variant="outline">すべて見る <ArrowRight className="size-4" /></ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">{challenges.slice(0, 3).map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid overflow-hidden rounded-[2rem] bg-admin text-white lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="text-xs font-black tracking-[0.2em] text-[#ffc49d]">FOR SHOP OWNERS</p><h2 className="mt-5 text-3xl font-black">まだ、課題になっていなくて大丈夫。</h2>
              <p className="mt-5 leading-8 text-[#cbd5d2]">「最近ちょっと気になる」「いつか試したい」。その段階から運営が聞き取ります。住所や担当者情報は公開しません。</p><ButtonLink href="/owner/wishes/new" variant="owner" className="mt-8">WISHを登録する</ButtonLink>
            </div>
            <div className="border-t border-white/10 bg-[#29373d] p-8 sm:p-12 lg:border-l lg:border-t-0">
              <p className="text-xs font-black tracking-[0.2em] text-[#99bcff]">FOR STUDENTS</p><h2 className="mt-5 text-3xl font-black">与えられる課題ではなく、自分で選ぶ挑戦へ。</h2>
              <p className="mt-5 leading-8 text-[#cbd5d2]">専攻や学年だけで決めません。興味から選び、地域の人と小さく実験する入口をつくります。</p><ButtonLink href="/challenges" variant="student" className="mt-8">Challengeを探す</ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
