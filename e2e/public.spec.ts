import { expect, test } from "@playwright/test";

test("landing explains the WISH to Challenge flow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("商店主のWISHから");
  await expect(page.getByRole("link", { name: /WISHを相談する/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Challengeを見る/ })).toBeVisible();
});

test("student can browse a sample Challenge on mobile", async ({ page }) => {
  await page.goto("/challenges");
  await expect(page.getByRole("heading", { name: "街で、何を試す？" })).toBeVisible();
  await page.getByRole("link", { name: "老舗喫茶店に20代の新規顧客を呼べ。" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("老舗喫茶店");
  await expect(page.getByText("個人情報が自動公開されることはありません")).toBeVisible();
});
