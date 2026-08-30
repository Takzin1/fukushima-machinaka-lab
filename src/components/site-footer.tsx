import Link from "next/link";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#202c31] py-10 text-white">
      <Container className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold tracking-[0.2em] text-[#b9c7c3]">FUKUSHIMA</p><p className="mt-2 text-lg font-black tracking-[0.08em]">MACHINAKA LAB</p><p className="mt-3 text-sm text-[#bdc7c5]">商店主のWISHから、学生のChallengeをつくる。</p></div>
        <div className="flex flex-wrap gap-5 text-sm text-[#d7dfdd]"><Link href="/about" className="hover:text-white">LABとは</Link><Link href="/privacy" className="hover:text-white">プライバシー</Link><Link href="/terms" className="hover:text-white">利用規約</Link></div>
      </Container>
    </footer>
  );
}
