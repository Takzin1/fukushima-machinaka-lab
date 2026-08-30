import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return <section className="py-24"><Container className="max-w-xl text-center"><p className="text-7xl font-black text-[#cad2d0]">404</p><h1 className="mt-4 text-3xl font-black">ページが見つかりません</h1><p className="mt-4 leading-8 text-muted">URLが変更されたか、公開が終了した可能性があります。</p><ButtonLink href="/" variant="admin" className="mt-7">トップへ戻る</ButtonLink></Container></section>;
}
