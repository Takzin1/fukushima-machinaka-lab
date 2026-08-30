import type { ApplicationStatus, ChallengeStatus, WishStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const labels: Record<WishStatus | ChallengeStatus | ApplicationStatus, string> = {
  draft: "下書き", submitted: "受付済み", reviewing: "確認中",
  challenge_created: "Challenge化済み", closed: "終了", published: "公開中",
  archived: "アーカイブ", applied: "応募済み", interview: "面談",
  matched: "マッチング成立", not_selected: "今回は見送り", withdrawn: "辞退",
};

export function StatusPill({ status }: { status: WishStatus | ChallengeStatus | ApplicationStatus }) {
  const positive = status === "published" || status === "matched";
  const active = status === "reviewing" || status === "interview" || status === "submitted";
  return (
    <span className={cn(
      "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
      positive && "border-[#a6d6b9] bg-[#e8f6ed] text-[#176237]",
      active && "border-[#f1c18f] bg-[#fff3e6] text-[#954410]",
      !positive && !active && "border-line bg-[#f2f4f3] text-[#566468]",
    )}>{labels[status]}</span>
  );
}
