"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { PublicMapPin } from "@/lib/map/pins";
import type { PublicMapRolloutStatus } from "@/lib/map/rollout";
import { getMapStyle, mapTilerEnabled, MAPLIBRE_SCRIPT_URL, MAPLIBRE_STYLE_URL, type MapProvider } from "@/lib/map/provider";

type MapInstance = { remove: () => void };
type MarkerInstance = {
  setLngLat: (position: [number, number]) => MarkerInstance;
  addTo: (map: MapInstance) => MarkerInstance;
  setPopup: (popup: PopupInstance) => MarkerInstance;
};
type PopupInstance = {
  setText: (text: string) => PopupInstance;
};
type MapLibreGlobal = {
  Map: new (options: {
    container: HTMLElement;
    style: ReturnType<typeof getMapStyle>;
    center: [number, number];
    zoom: number;
    attributionControl: boolean;
  }) => MapInstance;
  Marker: new (options?: { color?: string }) => MarkerInstance;
  Popup: new (options?: { offset?: number }) => PopupInstance;
};
declare global { interface Window { maplibregl?: MapLibreGlobal } }

export function ChallengeMap({ pins, mapTilerKey, status }: {
  pins: PublicMapPin[];
  mapTilerKey?: string;
  status: PublicMapRolloutStatus;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [provider, setProvider] = useState<MapProvider>("gsi");
  const [error, setError] = useState<string | null>(null);
  const hasMapTiler = mapTilerEnabled(mapTilerKey);

  useEffect(() => {
    if (!loaded || !container.current) return;
    const lib = window.maplibregl;
    if (!lib) return;
    let map: MapInstance | undefined;
    try {
      map = new lib.Map({
        container: container.current,
        style: getMapStyle(provider, mapTilerKey),
        center: [140.46, 37.75],
        zoom: 13,
        attributionControl: true,
      });
      for (const pin of pins) {
        new lib.Marker({ color: pin.precision === "exact" ? "#2563eb" : "#e96b2c" })
          .setLngLat([pin.longitude, pin.latitude])
          // setText never evaluates markup from operators or participants.
          .setPopup(new lib.Popup({ offset: 22 }).setText(pin.title + "・" + pin.label))
          .addTo(map);
      }
    } catch {
      queueMicrotask(() => setError("地図を表示できませんでした。下の一覧からChallengeを確認してください。"));
    }
    return () => map?.remove();
  }, [loaded, provider, mapTilerKey, pins]);

  return (
    <div className="grid gap-5">
      <Script src={MAPLIBRE_SCRIPT_URL} strategy="afterInteractive" onReady={() => setLoaded(true)}
        onError={() => setError("地図の読み込みに失敗しました。一覧は引き続き利用できます。")} />
      <link rel="stylesheet" href={MAPLIBRE_STYLE_URL} />
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="背景地図の選択">
        <button type="button" aria-pressed={provider === "gsi"} onClick={() => { setProvider("gsi"); setError(null); }}
          className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold">国土地理院</button>
        <button type="button" aria-pressed={provider === "maptiler"} disabled={!hasMapTiler}
          onClick={() => { setProvider("maptiler"); setError(null); }}
          className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold disabled:opacity-40">MapTiler {hasMapTiler ? "" : "（未設定）"}</button>
      </div>
      <div ref={container} role="region" aria-label="福島市中心市街地のChallenge地図"
        className="h-[430px] overflow-hidden rounded-3xl border border-line bg-[#e5ebea] sm:h-[560px]" />
      {!loaded && !error && <p className="text-sm text-muted">地図を読み込み中です。</p>}
      {error && <p role="status" className="rounded-xl bg-[#fff8e7] px-4 py-3 text-sm">{error}</p>}
      <p className="text-xs leading-6 text-muted">地図の掲載位置は管理者が確認・公開承認したものだけです。橙色はエリア概略、青色は公開承認済みの正確な地点です。</p>
      {status === "disabled" && <p role="status" className="rounded-xl border border-line bg-white p-4 text-sm">地図の実データ連携は準備中です。公開許可を得た地点の登録後に表示します。</p>}
      {status === "unavailable" && <p role="alert" className="rounded-xl border border-line bg-white p-4 text-sm">地図掲載情報を取得できませんでした。Challenge一覧から確認してください。</p>}
      <div aria-label="地図掲載Challenge一覧">
        <h2 className="text-xl font-black">地図掲載中のChallenge（{pins.length}件）</h2>
        {pins.length ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pins.map((pin) => (
              <li key={pin.challengeId} className="rounded-2xl border border-line bg-white p-4">
                <Link className="font-bold text-student underline-offset-4 hover:underline" href={`/challenges/${pin.challengeId}`}>{pin.title}</Link>
                <p className="mt-2 text-sm text-muted">{pin.label}（{pin.precision === "area" ? "エリア概略" : "公開地点"}）</p>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 rounded-2xl border border-line bg-white p-5 text-sm text-muted">現時点で公開承認済みの位置情報はありません。Challengeの募集内容は一覧ページから確認できます。</p>}
      </div>
    </div>
  );
}
