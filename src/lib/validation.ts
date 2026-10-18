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

// Coordinates used by the public map are entered and approved separately by admins.
const coordinate = (min: number, max: number) =>
  z.string().trim().min(1).transform((value) => Number(value)).pipe(z.number().finite().min(min).max(max));

export const mapLocationSchema = z.object({
  challengeId: z.string().uuid(),
  latitude: coordinate(-90, 90),
  longitude: coordinate(-180, 180),
  label: requiredText("地図公開ラベル", 120, 2),
  precision: z.enum(["area", "exact"]),
  approved: z.enum(["on"]).optional(),
});

const numericValue = z.string().trim().min(1)
  .transform((value) => Number(value))
  .pipe(z.number().finite().min(-1_000_000_000).max(1_000_000_000));

const observationDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "観測日を指定してください。")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value;
  }, "有効な観測日を指定してください。");

const optionalEvidenceUrl = z.string().trim().max(500)
  .refine((value) => value === "" || (URL.canParse(value) && new URL(value).protocol === "https:"),
    "HTTPSの根拠URLを指定してください。")
  .transform((value) => value || null);

export const createLabMetricSchema = z.object({
  projectId: z.string().uuid(),
  name: requiredText("KPI名", 120, 3),
  unit: requiredText("単位", 20, 1),
  direction: z.enum(["higher", "lower"]),
});

export const recordLabObservationSchema = z.object({
  projectId: z.string().uuid(),
  metricId: z.string().uuid(),
  phase: z.enum(["baseline", "after"]),
  value: numericValue,
  windowDays: z.string().trim().min(1).transform((value) => Number(value))
    .pipe(z.number().int().min(1).max(366)),
  methodNote: requiredText("測定方法", 240, 5),
  measuredDate: observationDate,
  evidenceUrl: optionalEvidenceUrl,
  contextNote: optionalText(1200),
});

const experimentNote = requiredText("理由・実施記録", 600, 10);
const experimentStatus = z.enum(["planning", "active", "paused", "completed", "canceled"]);
const milestoneStatus = z.enum(["todo", "doing", "blocked", "done"]);

export const transitionLabProjectSchema = z.object({
  projectId: z.string().uuid(),
  expectedStatus: experimentStatus,
  nextStatus: experimentStatus,
  note: experimentNote,
});

export const createLabMilestoneSchema = z.object({
  projectId: z.string().uuid(),
  title: requiredText("マイルストーン名", 180, 5),
  assigneeRole: z.enum(["admin", "student", "shop_owner"]),
  dueDate: z.string().trim()
    .refine((value) => {
      if (value === "") return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const [year, month, day] = value.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === value;
    }, "有効な期限日を入力してください。"),
});

export const transitionLabMilestoneSchema = z.object({
  projectId: z.string().uuid(),
  milestoneId: z.string().uuid(),
  expectedStatus: milestoneStatus,
  nextStatus: milestoneStatus,
  note: experimentNote,
});

export const createLabProjectSchema = z.object({
  applicationId: z.string().uuid(),
  goal: requiredText("実験目標", 300, 10),
  baselineNote: optionalText(1200),
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
