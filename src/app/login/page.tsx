import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "ログイン" };
export default function LoginPage() {
  return <section className="py-16 sm:py-24"><Container className="max-w-xl"><div className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_18px_60px_rgb(30_42_46/8%)] sm:p-10"><p className="text-xs font-black tracking-[0.2em] text-student">WELCOME BACK</p><h1 className="mt-3 text-3xl font-black">ログイン</h1><p className="mt-3 text-sm leading-7 text-muted">WISHや応募の状況を確認します。</p><div className="mt-8"><LoginForm /></div><p className="mt-7 border-t border-line pt-6 text-center text-sm text-muted">はじめて利用する方は <Link href="/register" className="font-bold text-student underline">新規登録</Link></p></div></Container></section>;
}
