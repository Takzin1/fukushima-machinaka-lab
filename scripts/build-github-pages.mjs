/**
 * GitHub Pages 用の静的ビルド。
 * GitHub Pages はサーバーを持たないため、Firebase 認証・SQL Connect・Server Actions は動かない。
 * このスクリプトは一時コピーから非対応ルートを除外して `next build` を実行し、元のソースは変更しない。
 * 公開ページ（/, /about, /challenges, /challenges/[id], /privacy, /terms）は SAMPLE データのプレビューとして出力される。
 */
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const incompatible = [
  // Vercel の稼働確認用 API。GitHub Pages にはサーバーがないため除外する。
  "src/app/api/health",
  // 認証必須の動的ページ。静的書き出しでは生成対象を持たないため除外する。
  "src/app/owner/wishes/[id]",
  "src/app/admin/wishes/[id]",
];
const dynamicChallengePage = path.join(root, "src/app/challenges/[id]/page.tsx");
const forceDynamicConfig = 'export const dynamic = "force-dynamic";\n';

const basePath = process.env.GITHUB_PAGES_BASE_PATH ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://example.github.io${basePath}`;
const buildParent = mkdtempSync(path.join(root, ".pages-build-"));
const buildRoot = path.join(buildParent, "project");
const excludedRoots = new Set([".git", ".next", ".pages-stash", "node_modules", "out"]);
let status = 1;

try {
  const shouldCopy = (source) => {
    const rel = path.relative(root, source);
    const firstSegment = rel.split(path.sep)[0];
    if (excludedRoots.has(firstSegment) || firstSegment.startsWith(".pages-build-")) {
      return false;
    }
    return !incompatible.some(
      (entry) => rel === entry || rel.startsWith(`${entry}${path.sep}`),
    );
  };

  mkdirSync(buildRoot, { recursive: true });
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const source = path.join(root, entry.name);
    if (!shouldCopy(source)) continue;
    cpSync(source, path.join(buildRoot, entry.name), {
      recursive: true,
      filter: shouldCopy,
    });
  }
  const copiedChallengePage = path.join(buildRoot, path.relative(root, dynamicChallengePage));
  const challengeSource = readFileSync(copiedChallengePage, "utf8");
  if (!challengeSource.includes(forceDynamicConfig)) {
    throw new Error("Challenge detail page is missing the expected force-dynamic config.");
  }
  writeFileSync(copiedChallengePage, challengeSource.replace(forceDynamicConfig, ""));

  const result = spawnSync(
    process.execPath,
    [path.join(root, "node_modules/next/dist/bin/next"), "build"],
    {
      cwd: buildRoot,
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
    },
  );
  status = result.status ?? 1;
  if (status === 0) {
    const exported = path.join(buildRoot, "out");
    writeFileSync(path.join(exported, ".nojekyll"), "");
    rmSync(path.join(root, "out"), { recursive: true, force: true });
    cpSync(exported, path.join(root, "out"), { recursive: true });
  }
} finally {
  rmSync(buildParent, { recursive: true, force: true });
}
process.exit(status);
