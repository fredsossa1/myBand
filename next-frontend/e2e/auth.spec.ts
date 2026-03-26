import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@myband.test";
const ADMIN_PASSWORD = "Admin1234!";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/", { timeout: 15000 });
}

test.describe("Authentication flow", () => {
  test("unauthenticated user is redirected to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Band Availability" })).toBeVisible();
  });

  test("login page renders email, password, and submit button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("wrong credentials show an error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.locator("[data-testid='login-error']")).toBeVisible({ timeout: 8000 });
  });

  test("admin can log in and lands on the schedule page", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL("/");
    // Schedule page header should be visible
    await expect(page.getByRole("heading", { name: "Schedule" })).toBeVisible({ timeout: 8000 });
  });

  test("admin sees the Admin badge in the sidebar", async ({ page }) => {
    await loginAsAdmin(page);
    // Wait for the async admin check to complete — badge appears in sidebar
    await expect(page.getByText("Admin").first()).toBeVisible({ timeout: 10000 });
  });

  test("admin can access the /stats analytics page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/stats");
    await expect(page).toHaveURL(/\/stats/);
    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible({ timeout: 8000 });
  });

  test("admin can see the Members button in the sidebar", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("button", { name: /members/i })).toBeVisible({ timeout: 8000 });
  });

  test("logout redirects to /login", async ({ page }) => {
    await loginAsAdmin(page);
    // The logout button is in the sidebar
    await page.getByRole("button", { name: /logout|sign out/i }).first().click();
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });
});
