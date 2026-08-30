import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import type { Challenge } from "@/types/domain";
import { formatDate } from "@/lib/utils";

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <article className="group relative flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-[0_12px_40px_rgb(30_42_46/6%)] transition hover:-translate-y-1 hover:border-[#c8d1cf] hover:shadow-[0_18px_48px_rgb(30_42_46/10%)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-student-soft px-3 py-1 text-xs font-bold text-student">{challenge.category}</span>
        {challenge.is_sample ? <span className="rounded-full border border-[#e3c08a] bg-[#fff8e7] px-2.5 py-1 text-[10px] font-black tracking-wide text-[#91611c]">SAMPLE</span> : null}
      </div>
      <h2 className="balance mt-5 text-xl font-black leading-8 tracking-tight"><Link href={`/challenges/${challenge.id}`} className="after:absolute after:inset-0">{challenge.title}</Link></h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted">{challenge.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2">{challenge.skills.slice(0, 3).map((skill) => <span key={skill} className="rounded-lg bg-[#f2f4f3] px-2.5 py-1 text-xs font-medium text-[#556265]">{skill}</span>)}</div>
      <dl className="mt-6 grid gap-2 border-t border-line pt-4 text-xs text-muted">
        <div className="flex items-center gap-2"><MapPin className="size-3.5" aria-hidden="true" /><dd>{challenge.area}</dd></div>
        <div className="flex items-center gap-2"><CalendarDays className="size-3.5" aria-hidden="true" /><dd>締切 {formatDate(challenge.deadline)}</dd></div>
        <div className="flex items-center gap-2"><Users className="size-3.5" aria-hidden="true" /><dd>募集 {challenge.capacity}名</dd></div>
      </dl>
      <div className="mt-auto flex items-center justify-end pt-5 text-sm font-bold text-student">詳細を見る <ArrowUpRight className="ml-1 size-4" aria-hidden="true" /></div>
    </article>
  );
}
