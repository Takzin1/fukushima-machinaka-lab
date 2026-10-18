import { describe, expect, it } from "vitest";
import { applicationSchema, challengeSchema, registerSchema, wishSchema, mapLocationSchema, createLabProjectSchema, createLabMetricSchema, recordLabObservationSchema, transitionLabProjectSchema, createLabMilestoneSchema, transitionLabMilestoneSchema } from "@/lib/validation";

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

  it("requires valid reviewed map coordinates", () => {
    const good = { challengeId: "11111111-1111-4111-8111-111111111111", latitude: "37.75", longitude: "140.46", label: "すずらん通り", precision: "area", approved: "on" };
    expect(mapLocationSchema.safeParse(good).success).toBe(true);
    expect(mapLocationSchema.safeParse({ ...good, latitude: "" }).success).toBe(false);
    expect(mapLocationSchema.safeParse({ ...good, longitude: "181" }).success).toBe(false);
    expect(mapLocationSchema.safeParse({ ...good, precision: "private" }).success).toBe(false);
  });

  it("validates LAB creation input and cannot be made from empty goals", () => {
    const good = {
      applicationId: "11111111-1111-4111-8111-111111111111",
      goal: "4週間で店舗の新規来店の変化を測定する",
      baselineNote: "",
    };
    expect(createLabProjectSchema.safeParse(good).success).toBe(true);
    expect(createLabProjectSchema.safeParse({ ...good, goal: "短い" }).success).toBe(false);
    expect(createLabProjectSchema.safeParse({ ...good, applicationId: "fake" }).success).toBe(false);
  });

  it("validates LAB KPI definitions and numeric observation data", () => {
    const metric = {
      projectId: "11111111-1111-4111-8111-111111111111",
      name: "日別来店人数", unit: "人", direction: "higher",
    };
    expect(createLabMetricSchema.safeParse(metric).success).toBe(true);
    expect(createLabMetricSchema.safeParse({ ...metric, direction: "maximize_money" }).success).toBe(false);
    const entry = {
      ...{ projectId: metric.projectId },
      metricId: "22222222-2222-4222-8222-222222222222",
      phase: "baseline", value: "104", windowDays: "7",
      methodNote: "POS週次集計", measuredDate: "2026-10-18",
      evidenceUrl: "https://example.com/receipt", contextNote: "雨の日あり",
    };
    expect(recordLabObservationSchema.safeParse(entry).success).toBe(true);
    for (const wrong of [
      { ...entry, value: "" }, { ...entry, value: "NaN" },
      { ...entry, windowDays: "0" }, { ...entry, windowDays: "7.5" },
      { ...entry, measuredDate: "2026-02-31" },
      { ...entry, evidenceUrl: "javascript:alert(1)" },
      { ...entry, evidenceUrl: "http://example.com" },
      { ...entry, phase: "estimate" },
    ]) expect(recordLabObservationSchema.safeParse(wrong).success).toBe(false);
  });

  it("rejects malformed workflow changes and assignees", () => {
    const projectId = "11111111-1111-4111-8111-111111111111";
    const milestoneId = "22222222-2222-4222-8222-222222222222";
    const change = { projectId, expectedStatus:"active", nextStatus:"paused", note:"天候不良のため中断します。" };
    expect(transitionLabProjectSchema.safeParse(change).success).toBe(true);
    expect(transitionLabProjectSchema.safeParse({ ...change, note:"short" }).success).toBe(false);
    expect(transitionLabProjectSchema.safeParse({ ...change, nextStatus:"published" }).success).toBe(false);
    const milestone = { projectId, title:"お客様インタビュー実施", assigneeRole:"student", dueDate:"2026-11-05" };
    expect(createLabMilestoneSchema.safeParse(milestone).success).toBe(true);
    expect(createLabMilestoneSchema.safeParse({ ...milestone, assigneeRole:"anyone" }).success).toBe(false);
    expect(createLabMilestoneSchema.safeParse({ ...milestone, dueDate:"2026-02-31" }).success).toBe(false);
    const update = { projectId, milestoneId, expectedStatus:"todo", nextStatus:"doing", note:"聞き取りを開始しました。" };
    expect(transitionLabMilestoneSchema.safeParse(update).success).toBe(true);
    expect(transitionLabMilestoneSchema.safeParse({ ...update, milestoneId:"evil" }).success).toBe(false);
  });

  it("requires consent when creating an Application", () => {
    const result = applicationSchema.safeParse({ challengeId: "11111111-1111-4111-8111-111111111111", motivation: "地域の魅力を伝える企画を実際に試してみたいと考えたためです。", interestReason: "普段利用する街の課題だからです。", skillsExperience: "学生団体でSNSを運用した経験があります。", availability: "10月から12月", notes: "", privacyAgreed: "" });
    expect(result.success).toBe(false);
  });
});
