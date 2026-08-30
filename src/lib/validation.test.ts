import { describe, expect, it } from "vitest";
import { applicationSchema, challengeSchema, registerSchema, wishSchema } from "@/lib/validation";

describe("input validation", () => {
  it("accepts a valid shop-owner registration and rejects admin self-registration", () => {
    const valid = registerSchema.safeParse({ displayName: "福島 太郎", email: "owner@example.com", password: "securepass1", role: "shop_owner", university: "", faculty: "", grade: "", privacyAgreed: "on" });
    const forgedAdmin = registerSchema.safeParse({ displayName: "攻撃者", email: "bad@example.com", password: "securepass1", role: "admin", university: "", faculty: "", grade: "", privacyAgreed: "on" });
    expect(valid.success).toBe(true);
    expect(forgedAdmin.success).toBe(false);
  });

  it("validates WISH create input", () => {
    expect(wishSchema.safeParse({ shopName: "まちなか喫茶", contactName: "福島 太郎", contactEmail: "owner@example.com", industry: "飲食", websiteUrl: "", snsUrl: "", address: "", problem: "若い世代との接点をつくり、新しい常連客と出会いたいです。", desiredOutcome: "学生と一つの集客企画を試せている状態です。", experimentIdea: "", preferredPeriod: "", notes: "" }).success).toBe(true);
  });

  it("validates Challenge publish input", () => {
    expect(challengeSchema.safeParse({ wishId: "11111111-1111-4111-8111-111111111111", title: "老舗喫茶店に20代の新規顧客を呼べ。", summary: "店の魅力を再発見し、小さな集客実験を設計して実行します。", background: "長く地域に愛されてきた一方、若い世代との接点が減っています。", problem: "既存の魅力が若い世代へ十分に届かず、新しい顧客接点が不足しています。", desiredOutcome: "学生と店主が集客施策を一つ試せている状態。", shopDisplayName: "まちなか喫茶", category: "マーケティング", skills: "SNS、写真", period: "4週間", workload: "週2時間", area: "福島市", capacity: "3", deadline: "2026-10-31", status: "published" }).success).toBe(true);
  });

  it("requires consent when creating an Application", () => {
    const result = applicationSchema.safeParse({ challengeId: "11111111-1111-4111-8111-111111111111", motivation: "地域の魅力を伝える企画を実際に試してみたいと考えたためです。", interestReason: "普段利用する街の課題だからです。", skillsExperience: "学生団体でSNSを運用した経験があります。", availability: "10月から12月", notes: "", privacyAgreed: "" });
    expect(result.success).toBe(false);
  });
});
