import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const alt = "FUKUSHIMA MACHINAKA LAB — 商店主のWISHから、学生のChallengeをつくる。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f8f7f3", color: "#1e2a2e", padding: 72, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}><div style={{ width: 54, height: 54, borderRadius: 18, background: "#253238", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>M</div><div style={{ display: "flex", fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>FUKUSHIMA MACHINAKA LAB</div></div>
      <div style={{ display: "flex", flexDirection: "column", fontSize: 72, lineHeight: 1.18, fontWeight: 900, letterSpacing: -3 }}><div style={{ display: "flex" }}>商店主の <span style={{ color: "#e96b2c" }}>WISH</span> から、</div><div style={{ display: "flex" }}>学生の <span style={{ color: "#2563eb" }}>Challenge</span> をつくる。</div></div>
      <div style={{ display: "flex", fontSize: 25, color: "#667276" }}>地域の「やりたい・困った」を、学生との小さな実験に変える共創LAB。</div>
    </div>,
    size,
  );
}
