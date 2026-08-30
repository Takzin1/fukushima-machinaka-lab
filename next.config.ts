import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repoName = process.env.GITHUB_PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: repoName,
        assetPrefix: repoName || undefined,
        trailingSlash: true,
        images: { unoptimized: true },
        // Server Actions は静的書き出しで使えないため、案内だけ返すダミーへ差し替える
        turbopack: {
          resolveAlias: {
            "@/actions/auth": "./src/actions-static/auth.ts",
            "@/actions/wishes": "./src/actions-static/wishes.ts",
            "@/actions/applications": "./src/actions-static/applications.ts",
            "@/actions/admin": "./src/actions-static/admin.ts",
          },
        },
      }
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
