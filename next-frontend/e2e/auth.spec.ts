import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@myband.test";
const ADMIN_PASSWORD = "Admin1234!";
const BASE_URL = "http://localhost:3000";

// Helper: sign in as admin
async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
}

test.describe("Authentication flow", () => {
  test("unauthenticated user is redirected to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    // CardTitle renders as a div, not heading role — use text matcher
    await expect(page.getByText("Band Availability").first()).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("wrong credentials show error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@email.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Error paragraph rendered via state.error
    await expect(page.locator("p.text-red-300")).toBeVisible({ timeout: 8000 });
  });

  test("admin can log in and reaches dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test("admin sees admin badge after login", async ({ page }) => {
    await loginAsAdmin(page);
    // isAdmin is set asynchronously — wait for the green admin indicator
    await expect(
      page.locator('[class*="green"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("admin can access /stats page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/stats");
    await expect(page).toHaveURL(/\/stats/);
  });

  test("logged-in user is not redirected to /login", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/availability");
    await expect(page).toHaveURL(/\/availability/);
  });

  test("logout redirects to /login", async ({ page }) => {
    await loginAsAdmin(page);
    // Click the logout button by its role and partial text
    await page.getByRole("button", { name: /logout|sign out/i }).first().click();
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
