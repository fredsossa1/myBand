/**
 * Visual regression helpers — captures screenshots of each page for manual review.
 * Not run in CI by default; invoke with: npx playwright test e2e/screenshot-pages.spec.ts
 */
import { test } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@myband.test");
  await page.getByLabel("Password").fill("Admin1234!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/", { timeout: 15000 });
  // Wait for admin badge before capturing — confirms async checks are done
  await page.getByText("Admin").first().waitFor({ timeout: 8000 });
}

test("screenshot: login page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/page-login.png", fullPage: true });
});

test("screenshot: schedule (home)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAsAdmin(page);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/page-schedule.png", fullPage: true });
});

test("screenshot: analytics", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAsAdmin(page);
  await page.goto("/stats");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/tmp/page-analytics.png", fullPage: true });
});

test("screenshot: members modal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAsAdmin(page);
  await page.getByRole("button", { name: /members/i }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/page-members-modal.png", fullPage: true });
});
