import { describe, expect, it, vi } from "vitest";
import { publishChallenge, submitApplication, submitWish, type WorkflowGateway } from "@/features/workflows";

function gateway(): WorkflowGateway {
  return {
    createWish: vi.fn().mockResolvedValue("wish-id"),
    createChallenge: vi.fn().mockResolvedValue("challenge-id"),
    markWishChallengeCreated: vi.fn().mockResolvedValue(undefined),
    isChallengeOpen: vi.fn().mockResolvedValue(true),
    createApplication: vi.fn().mockResolvedValue("application-id"),
  };
}

describe("critical workflow services", () => {
  it("creates a WISH only for a shop owner", async () => {
    const store = gateway();
    const input = { shopName: "まちなか喫茶", contactName: "福島 太郎", contactEmail: "owner@example.com", industry: "飲食", websiteUrl: null, snsUrl: null, address: null, problem: "若い世代との接点をつくり、新しい常連客と出会いたいです。", desiredOutcome: "学生と一つの集客企画を試せている状態です。", experimentIdea: null, preferredPeriod: null, notes: null };
    await expect(submitWish({ id: "owner", role: "shop_owner" }, input, store)).resolves.toBe("wish-id");
    await expect(submitWish({ id: "student", role: "student" }, input, store)).rejects.toThrow("FORBIDDEN");
  });

  it("publishes a Challenge and advances its WISH", async () => {
    const store = gateway();
    const input = { wishId: "11111111-1111-4111-8111-111111111111", title: "老舗喫茶店に20代の新規顧客を呼べ。", summary: "店の魅力を再発見し、小さな集客実験を設計して実行します。", background: "長く地域に愛されてきた一方、若い世代との接点が減っています。", problem: "既存の魅力が若い世代へ十分に届かず、新しい顧客接点が不足しています。", desiredOutcome: "学生と店主が集客施策を一つ試せている状態。", shopDisplayName: "まちなか喫茶", category: "マーケティング", skills: ["SNS"], period: "4週間", workload: "週2時間", area: "福島市", capacity: 3, deadline: "2026-10-31", status: "published" as const };
    await expect(publishChallenge({ id: "admin", role: "admin" }, input, store)).resolves.toBe("challenge-id");
    expect(store.markWishChallengeCreated).toHaveBeenCalledWith(input.wishId);
  });

  it("creates one Application for an open Challenge", async () => {
    const store = gateway();
    const input = { challengeId: "11111111-1111-4111-8111-111111111111", motivation: "地域の魅力を伝える企画を実際に試してみたいと考えたためです。", interestReason: "普段利用する街の課題だからです。", skillsExperience: "学生団体でSNSを運用した経験があります。", availability: "10月から12月", notes: null, privacyAgreed: "on" as const };
    await expect(submitApplication({ id: "student", role: "student" }, input, store)).resolves.toBe("application-id");
    expect(store.isChallengeOpen).toHaveBeenCalledWith(input.challengeId);
  });
});
