import { Container } from "@/components/ui/container";
export default function Loading() {
  return <section className="py-20" aria-label="読み込み中"><Container><div className="animate-pulse"><div className="h-4 w-32 rounded bg-[#dde3e1]" /><div className="mt-5 h-12 max-w-xl rounded bg-[#dde3e1]" /><div className="mt-10 grid gap-5 md:grid-cols-3">{[1,2,3].map((item) => <div key={item} className="h-72 rounded-3xl bg-[#e6ebe9]" />)}</div></div></Container></section>;
}
