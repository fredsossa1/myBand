import { test, expect } from "@playwright/test";

test("debug: inspect dashboard after login", async ({ page }) => {
  // Intercept admin verify calls synchronously (request events are sync)
  const verifyRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/admin/verify")) {
      verifyRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@myband.test");
  await page.getByLabel("Password").fill("Admin1234!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log("VERIFY REQUESTS MADE:", JSON.stringify(verifyRequests));

  // Check green badge
  const greenCount = await page.locator('[class*="green"]').count();
  console.log("GREEN ELEMENTS:", greenCount);

  // Log what's in the sidebar
  const sidebarText = await page.locator('.glass').first().innerText().catch(() => "not found");
  console.log("SIDEBAR TEXT:", sidebarText.replace(/\n/g, " | "));

  await page.screenshot({ path: "/tmp/dashboard-after-login.png", fullPage: true });
});

test("debug: logout flow", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@myband.test");
  await page.getByLabel("Password").fill("Admin1234!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("http://localhost:3000/", { timeout: 15000 });
  await page.waitForTimeout(1000);

  console.log("URL after login:", page.url());

  const logoutBtn = page.getByRole("button", { name: /logout/i }).first();
  await logoutBtn.click();
  // Wait for navigation with a more flexible approach
  try {
    await page.waitForURL(/\/login/, { timeout: 10000 });
    console.log("NAVIGATED TO LOGIN:", page.url());
  } catch {
    console.log("DID NOT NAVIGATE - URL:", page.url());
    // Check if supabase signOut is stuck
    const result = await page.evaluate(async () => {
      const url = window.location.href;
      return url;
    });
    console.log("JS location.href:", result);
  }
  await page.screenshot({ path: "/tmp/after-logout.png" });
});
