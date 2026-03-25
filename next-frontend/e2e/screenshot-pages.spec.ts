import { test } from "@playwright/test";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@myband.test");
  await page.getByLabel("Password").fill("Admin1234!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
  // Wait for admin badge to appear (confirms admin check completed)
  await page.locator('[class*="green"]').first().waitFor({ timeout: 8000 });
}

test("screenshot: login page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/page-login.png", fullPage: true });
});

test("screenshot: dashboard", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAsAdmin(page);
  await page.screenshot({ path: "/tmp/page-dashboard.png", fullPage: true });
});

test("screenshot: availability", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAsAdmin(page);
  await page.goto("/availability");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/tmp/page-availability.png", fullPage: true });
});

test("screenshot: stats", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loginAsAdmin(page);
  await page.goto("/stats");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "/tmp/page-stats.png", fullPage: true });
});
