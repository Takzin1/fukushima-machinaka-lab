import { ShieldX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ForbiddenPage() {
  return <section className="py-24"><Container className="max-w-xl text-center"><div className="mx-auto grid size-16 place-items-center rounded-3xl bg-owner-soft text-owner"><ShieldX className="size-7" /></div><h1 className="mt-6 text-3xl font-black">このページを表示する権限がありません</h1><p className="mt-4 leading-8 text-muted">別の利用区分のページです。アカウントのダッシュボードから操作してください。</p><ButtonLink href="/auth/continue" variant="admin" className="mt-7">ダッシュボードへ</ButtonLink></Container></section>;
}
