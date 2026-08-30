"use client";
import { CircleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="mx-auto max-w-xl px-5 py-24 text-center"><CircleAlert className="mx-auto size-10 text-owner" /><h1 className="mt-5 text-3xl font-black">読み込みに失敗しました</h1><p className="mt-4 leading-8 text-muted">通信状況を確認して、もう一度お試しください。</p><button onClick={reset} className={buttonClass("admin", "mt-7")}>再試行する</button></section>;
}
