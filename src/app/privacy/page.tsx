import type { Metadata } from "next";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "プライバシーポリシー" };
const sections = [
  ["1. 取得する情報", "氏名・表示名、メールアドレス、学校・所属情報、店舗情報、WISH・Challengeへの応募内容、サービス利用に必要な認証情報を取得します。"],
  ["2. 利用目的", "本人確認、WISHの確認とChallenge化、応募審査とマッチング、運営上の連絡、安全管理、利用状況の改善に利用します。"],
  ["3. 情報の共有", "学生の個人情報を商店主へ自動公開しません。マッチングに必要な共有は、運営が目的と範囲を確認した上で行います。法令に基づく場合を除き、本人の同意なく第三者提供しません。"],
  ["4. 保存と安全管理", "Google Cloud SQLとFirebaseを利用し、暗号化通信、サーバー側セッション、SQL Connectの認証・認可ルール等の安全管理措置を講じます。"],
  ["5. 開示・訂正・削除", "本人からの請求を確認した上で、保有情報の開示、訂正、利用停止、削除に対応します。"],
  ["6. 改定", "実証内容や法令の変更に応じて本ポリシーを改定する場合があります。重要な変更は本サービス上で告知します。"],
];
export default function PrivacyPage() {
  return <section className="py-16 sm:py-24"><Container className="max-w-3xl"><p className="text-xs font-black tracking-[0.2em] text-student">PRIVACY</p><h1 className="mt-4 text-4xl font-black">プライバシーポリシー</h1><div className="mt-6 rounded-2xl border border-[#e3c08a] bg-[#fff8e7] p-4 text-sm leading-7 text-[#76501b]">本ページはMVP実証用の叩き台です。本番公開前に、運営主体・問い合わせ先・保存期間・委託先を確定し、専門家の確認を受けて改訂します。</div><div className="mt-10 grid gap-8">{sections.map(([title, body]) => <section key={title}><h2 className="text-lg font-black">{title}</h2><p className="mt-3 leading-8 text-muted">{body}</p></section>)}</div><p className="mt-12 border-t border-line pt-6 text-sm text-muted">制定日：2026年8月30日（MVPドラフト）</p></Container></section>;
}
