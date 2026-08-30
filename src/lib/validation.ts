import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || URL.canParse(value), "正しいURLを入力してください。")
  .transform((value) => (value === "" ? null : value));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}文字以内で入力してください。`)
    .transform((value) => (value === "" ? null : value));

const requiredText = (label: string, max: number, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${label}を入力してください。`)
    .max(max, `${label}は${max}文字以内で入力してください。`);

export const loginSchema = z.object({
  email: z.string().trim().email("正しいメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上です。"),
});

export const registerSchema = z.object({
  displayName: requiredText("氏名・表示名", 80, 2),
  email: z.string().trim().email("正しいメールアドレスを入力してください。"),
  password: z
    .string()
    .min(10, "パスワードは10文字以上です。")
    .regex(/[A-Za-z]/, "英字を1文字以上含めてください。")
    .regex(/[0-9]/, "数字を1文字以上含めてください。"),
  role: z.enum(["shop_owner", "student"], {
    message: "利用区分を選択してください。",
  }),
  university: optionalText(120),
  faculty: optionalText(120),
  grade: optionalText(40),
  privacyAgreed: z.literal("on", {
    message: "プライバシーポリシーへの同意が必要です。",
  }),
});

export const wishSchema = z.object({
  shopName: requiredText("店舗名", 120, 2),
  contactName: requiredText("担当者名", 80, 2),
  contactEmail: z.string().trim().email("正しいメールアドレスを入力してください。"),
  industry: requiredText("業種", 80),
  websiteUrl: optionalUrl,
  snsUrl: optionalUrl,
  address: optionalText(240),
  problem: requiredText("困っていること・やりたいこと", 2000, 20),
  desiredOutcome: requiredText("期待する状態", 1200, 10),
  experimentIdea: optionalText(1200),
  preferredPeriod: optionalText(120),
  notes: optionalText(1200),
});

export const applicationSchema = z.object({
  challengeId: z.string().uuid("Challenge IDが不正です。"),
  motivation: requiredText("応募理由", 1600, 20),
  interestReason: requiredText("興味を持った理由", 1200, 10),
  skillsExperience: requiredText("経験・スキル", 1200, 10),
  availability: requiredText("参加可能期間", 240, 2),
  notes: optionalText(1000),
  privacyAgreed: z.literal("on", {
    message: "プライバシーポリシーへの同意が必要です。",
  }),
});

export const challengeSchema = z.object({
  wishId: z.string().uuid("WISH IDが不正です。"),
  title: requiredText("タイトル", 160, 8),
  summary: requiredText("概要", 500, 20),
  background: requiredText("背景", 1600, 20),
  problem: requiredText("解決したい課題", 1600, 20),
  desiredOutcome: requiredText("期待する成果", 1200, 10),
  shopDisplayName: requiredText("公開店舗名", 120, 2),
  category: requiredText("カテゴリー", 80),
  skills: z
    .string()
    .trim()
    .transform((value) =>
      value
        .split(/[、,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  period: optionalText(120),
  workload: optionalText(120),
  area: requiredText("活動地域", 160, 2),
  capacity: z.coerce.number().int().min(1).max(50),
  deadline: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value)),
  status: z.enum(["draft", "published"]),
});

export const applicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    "applied",
    "reviewing",
    "interview",
    "matched",
    "not_selected",
    "withdrawn",
  ]),
});

export function formDataObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export function fieldErrors(error: z.ZodError) {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
