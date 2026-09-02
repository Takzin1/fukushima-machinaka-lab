import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "@/lib/env";

describe("resolveSiteUrl", () => {
  it("uses an explicitly configured absolute URL", () => {
    expect(resolveSiteUrl("https://example.com/lab/", undefined)).toBe(
      "https://example.com/lab",
    );
  });

  it("falls back to the Vercel deployment hostname when the configured value is empty", () => {
    expect(resolveSiteUrl("", "example.vercel.app")).toBe(
      "https://example.vercel.app",
    );
  });

  it("ignores malformed configured URLs", () => {
    expect(resolveSiteUrl("not a valid URL", "example.vercel.app")).toBe(
      "https://example.vercel.app",
    );
  });

  it("uses localhost when no deploy URL is available", () => {
    expect(resolveSiteUrl(undefined, undefined)).toBe("http://localhost:3000");
  });
});
