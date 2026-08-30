import type { Metadata } from "next";
import { ArrowRight, Building2, EyeOff, FlaskConical, GraduationCap, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "MACHINAKA LABとは" };

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-white py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div><p className="text-xs font-black tracking-[0.22em] text-owner">ABOUT THE LAB</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">街全体を、<br />小さな実験室へ。</h1></div>
          <p className="max-w-2xl text-lg font-medium leading-9 text-muted">FUKUSHIMA MACHINAKA LABは、地域の個人商店主が持つ「WISH」と、学生の「やってみたい」を、運営者の伴走で安全につなぐ共創プラットフォームです。</p>
        </Container>
      </section>
      <section className="py-20">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Building2, label: "SHOP OWNER", title: "当事者の言葉から始める", body: "完成した企画書は不要です。困りごとや試したいことをWISHとして受け取ります。", tone: "owner" },
              { icon: GraduationCap, label: "STUDENT", title: "興味から自分で選ぶ", body: "学校や専攻から自動的に割り当てず、公開Challengeを見て学生自身が応募します。", tone: "student" },
              { icon: FlaskConical, label: "LAB OPERATOR", title: "小さく試せる形へ編集", body: "運営が情報を整理し、期間と成果を限定したChallengeへ変換して双方をつなぎます。", tone: "admin" },
            ].map(({ icon: Icon, label, title, body, tone }) => (
              <article key={label} className="rounded-3xl border border-line bg-white p-7">
                <div className={`grid size-12 place-items-center rounded-2xl ${tone === "owner" ? "bg-owner-soft text-owner" : tone === "student" ? "bg-student-soft text-student" : "bg-admin text-white"}`}><Icon className="size-5" /></div>
                <p className="mt-7 text-[10px] font-black tracking-[0.2em] text-muted">{label}</p><h2 className="mt-2 text-xl font-black">{title}</h2><p className="mt-4 text-sm leading-7 text-muted">{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-y border-line bg-[#eef3f0] py-20">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div><p className="text-xs font-black tracking-[0.2em] text-[#42745d]">SAFETY BY DESIGN</p><h2 className="mt-4 text-3xl font-black">人を直接つなぐ前に、<br />運営が間に入る。</h2></div>
          <div className="grid gap-4">
            <div className="flex gap-4 rounded-2xl bg-white p-5"><EyeOff className="mt-1 size-5 shrink-0 text-[#42745d]" /><div><h3 className="font-bold">WISHをそのまま公開しない</h3><p className="mt-2 text-sm leading-7 text-muted">担当者名、連絡先、住所などの非公開情報を切り分けてからChallenge化します。</p></div></div>
            <div className="flex gap-4 rounded-2xl bg-white p-5"><ShieldCheck className="mt-1 size-5 shrink-0 text-[#42745d]" /><div><h3 className="font-bold">学生情報を自動共有しない</h3><p className="mt-2 text-sm leading-7 text-muted">応募は運営が確認し、マッチング判断後に必要な範囲だけを共有します。</p></div></div>
          </div>
        </Container>
      </section>
      <section className="py-20"><Container className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-admin p-8 text-white sm:flex-row sm:items-center sm:p-12"><div><p className="text-sm font-bold text-[#ffc49d]">FUKUSHIMA MACHINAKA CAMPUS</p><h2 className="mt-3 text-3xl font-black">あなたのWISHから、最初の実験を。</h2></div><ButtonLink href="/register" variant="owner">参加する <ArrowRight className="size-4" /></ButtonLink></Container></section>
    </>
  );
}
