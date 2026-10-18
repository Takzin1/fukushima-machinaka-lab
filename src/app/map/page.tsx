import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ChallengeMap } from "@/components/map/challenge-map";
import { getPublicMapState } from "@/services/map-locations";

export const metadata: Metadata = {
  title: "まちなかMap",
  description: "公開承認済みChallengeを福島市中心市街地の地図で見る。",
};

export default async function PublicMapPage() {
  const mapState = await getPublicMapState();
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  return (
    <>
      <section className="border-b border-line bg-white py-12 sm:py-16">
        <Container>
          <p className="text-xs font-black tracking-[0.22em] text-student">MACHINAKA MAP</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">福島の街で、何を試す？</h1>
          <p className="mt-5 max-w-3xl leading-8 text-muted">
            福島市中心市街地のChallengeを地図から探す。掲載される地点は運営が個別に確認し、
            公開が承認されたものだけです。
          </p>
        </Container>
      </section>
      <section className="py-10 sm:py-14">
        <Container>
          <ChallengeMap pins={mapState.pins} status={mapState.status} mapTilerKey={mapTilerKey} />
          <p className="mt-8 text-sm text-muted"><Link href="/challenges" className="font-bold text-student underline">地図を使わずChallenge一覧を見る</Link></p>
        </Container>
      </section>
    </>
  );
}
