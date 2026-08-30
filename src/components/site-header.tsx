import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { Container } from "@/components/ui/container";
import { UserNav } from "@/components/user-nav";

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/90 bg-white/95 backdrop-blur">
      <Container className="flex h-[72px] items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3" aria-label="トップページ">
          <span className="grid size-10 place-items-center rounded-2xl bg-admin text-white"><FlaskConical className="size-5" aria-hidden="true" /></span>
          <span className="leading-none"><strong className="block text-sm tracking-[0.08em]">MACHINAKA LAB</strong><span className="mt-1 hidden text-[10px] font-bold tracking-[0.18em] text-muted sm:block">FUKUSHIMA</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-[#4c5a5e] md:flex" aria-label="主要ナビゲーション">
          <Link href="/about" className="hover:text-foreground">LABとは</Link>
          <Link href="/challenges" className="hover:text-foreground">Challenge</Link>
        </nav>
        <UserNav />
      </Container>
    </header>
  );
}
