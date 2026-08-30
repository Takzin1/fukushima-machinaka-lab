import type { Metadata } from "next";
import { ChallengeCard } from "@/components/challenge-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Container } from "@/components/ui/container";
import { getPublishedChallenges } from "@/services/challenges";

export const metadata: Metadata = { title: "Challenge一覧", description: "福島の商店主と学生が一緒に取り組む、小さな地域実験の一覧。" };

export default async function ChallengesPage() {
  const challenges = await getPublishedChallenges();
  return (
    <>
      <section className="border-b border-line bg-white py-16 sm:py-20"><Container><p className="text-xs font-black tracking-[0.22em] text-student">CHALLENGE BOARD</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">街で、何を試す？</h1><p className="mt-5 max-w-2xl leading-8 text-muted">商店主のWISHを、運営が学生向けChallengeへ編集しています。興味を起点に、自分で選んで応募してください。</p></Container></section>
      <section className="py-12 sm:py-16"><Container>{challenges.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{challenges.map((challenge) => <ChallengeCard key={challenge.id} challenge={challenge} />)}</div> : <EmptyState title="現在募集中のChallengeはありません" body="新しいChallenge公開まで少しお待ちください。" />}</Container></section>
    </>
  );
}
