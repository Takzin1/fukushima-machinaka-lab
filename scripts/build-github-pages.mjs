/**
 * GitHub Pages 用の静的ビルド。
 * GitHub Pages はサーバーを持たないため、Firebase 認証・SQL Connect・Server Actions は動かない。
 * このスクリプトは、静的書き出しと両立しないファイルを一時的に退避してから `next build` を実行し、終了後に必ず元へ戻す。
 * 公開ページ（/, /about, /challenges, /challenges/[id], /privacy, /terms）は SAMPLE データのプレビューとして出力される。
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const stash = path.join(root, ".pages-stash");
const incompatible = [
  // 認証必須の動的ページ。静的書き出しでは生成対象を持たないため除外する。
  "src/app/owner/wishes/[id]",
  "src/app/admin/wishes/[id]",
];

const basePath = process.env.GITHUB_PAGES_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://example.github.io${basePath}`;

mkdirSync(stash, { recursive: true });
const moved = [];
for (const rel of incompatible) {
  const from = path.join(root, rel);
  if (!existsSync(from)) continue;
  const to = path.join(stash, rel.replaceAll("/", "__"));
  renameSync(from, to);
  moved.push([from, to]);
}

let status = 1;
try {
  rmSync(path.join(root, "out"), { recursive: true, force: true });
  const result = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      GITHUB_PAGES_BASE_PATH: basePath,
      NEXT_PUBLIC_SITE_URL: siteUrl,
      // GitHub Pages では認証を使わない。値が入っていても静的プレビューとして出力する。
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "",
      NEXT_PUBLIC_FIREBASE_API_KEY: "",
      FIREBASE_ADMIN_CLIENT_EMAIL: "",
      FIREBASE_ADMIN_PRIVATE_KEY: "",
    },
  });
  status = result.status ?? 1;
  if (status === 0) {
    // Jekyll が _next/ を無視しないようにする
    const { writeFileSync } = await import("node:fs");
    writeFileSync(path.join(root, "out", ".nojekyll"), "");
  }
} finally {
  for (const [from, to] of moved) renameSync(to, from);
  rmSync(stash, { recursive: true, force: true });
}
process.exit(status);
