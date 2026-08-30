import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "利用規約" };
const sections = [
  ["1. 適用", "本規約は、FUKUSHIMA MACHINAKA LABのMVPを利用する商店主、学生および運営者に適用されます。"],
  ["2. 登録", "利用者は正確な情報を登録し、自身の認証情報を適切に管理してください。第三者へのアカウント貸与は禁止します。"],
  ["3. 禁止事項", "虚偽情報、権利侵害、差別・ハラスメント、営業妨害、不正アクセス、法令または公序良俗に反する行為を禁止します。"],
  ["4. マッチング", "応募はマッチング成立を保証しません。運営が双方の意向、安全性、実施可能性を確認し、必要に応じて面談を行います。"],
  ["5. 実証活動", "活動範囲、成果物、知的財産、費用、安全管理は、マッチング後に当事者と運営で個別に確認します。"],
  ["6. サービスの変更・停止", "MVP検証のため、機能を予告なく変更または停止する場合があります。重要な変更は可能な範囲で事前に告知します。"],
  ["7. 免責", "運営は合理的な安全管理に努めますが、利用者間の個別合意や活動成果を保証するものではありません。"],
];
export default function TermsPage() {
  return <section className="py-16 sm:py-24"><Container className="max-w-3xl"><p className="text-xs font-black tracking-[0.2em] text-owner">TERMS</p><h1 className="mt-4 text-4xl font-black">利用規約</h1><div className="mt-6 rounded-2xl border border-[#e3c08a] bg-[#fff8e7] p-4 text-sm leading-7 text-[#76501b]">本ページはMVP実証用の叩き台です。本番公開前に運営主体、責任範囲、準拠法・管轄等を確定し、専門家の確認を受けて改訂します。</div><div className="mt-10 grid gap-8">{sections.map(([title, body]) => <section key={title}><h2 className="text-lg font-black">{title}</h2><p className="mt-3 leading-8 text-muted">{body}</p></section>)}</div><p className="mt-12 border-t border-line pt-6 text-sm text-muted">制定日：2026年8月30日（MVPドラフト）</p></Container></section>;
}
