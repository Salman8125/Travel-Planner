import { expect, test } from "@playwright/test";

test("guests are redirected away from the admin area", async ({ page }) => {
  await page.goto("/admin/locations");
  await expect(page).toHaveURL(/\/login/);
});

test("an admin can sign in and manage locations", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@weathervane.dev");
  await page.getByLabel("Password").fill("admin12345");
  await page.getByRole("button", { name: /sign in/i }).click();

  // Land back on the public app, then open the now-visible admin area.
  await expect(page).toHaveURL("/");
  await page.goto("/admin/locations");

  await expect(page.getByRole("button", { name: /add location/i })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});
