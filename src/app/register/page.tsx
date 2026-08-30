import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "新規登録" };
export default function RegisterPage() {
  return <section className="py-16 sm:py-24"><Container className="max-w-3xl"><div className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_18px_60px_rgb(30_42_46/8%)] sm:p-10"><p className="text-xs font-black tracking-[0.2em] text-owner">JOIN THE LAB</p><h1 className="mt-3 text-3xl font-black">新規登録</h1><p className="mt-3 text-sm leading-7 text-muted">商店主はWISHを、学生はChallengeへの応募を登録できます。</p><div className="mt-8"><RegisterForm /></div><p className="mt-7 border-t border-line pt-6 text-center text-sm text-muted">登録済みの方は <Link href="/login" className="font-bold text-student underline">ログイン</Link></p></div></Container></section>;
}
