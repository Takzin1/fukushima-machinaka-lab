import type { FormState } from "@/types/domain";

/**
 * GitHub Pages（静的書き出し）用のダミー。
 * Server Actions は静的サイトでは動作しないため、送信時に案内メッセージだけを返す。
 * 本番（Vercel 等のサーバー実行環境）ではこのファイルは使われない。
 */
export const STATIC_PREVIEW_MESSAGE =
  "この画面は静的プレビューです。登録・ログイン・WISH相談・応募はサーバー版のWebAppで行えます。";

export async function staticFormAction(): Promise<FormState> {
  return { status: "error", message: STATIC_PREVIEW_MESSAGE };
}

export async function staticVoidAction(): Promise<void> {}
