import { expect, test } from "@playwright/test";

test("public flow: search a city, open it, see conditions + forecast + chart", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Search locations").fill("Istanbul");
  const card = page.getByRole("link").filter({ hasText: "Istanbul" }).first();
  await expect(card).toBeVisible();
  await card.click();

  await expect(page.getByRole("heading", { name: "Istanbul" })).toBeVisible();
  await expect(page.getByText("Current conditions")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Daily forecast" })).toBeVisible();
  await expect(page.locator("canvas")).toBeVisible();
});

test("temperature unit toggle switches all temperatures", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link").filter({ hasText: "Istanbul" }).first().click();

  const fahrenheit = page.getByRole("button", { name: "°F", exact: true });
  await fahrenheit.click();
  await expect(fahrenheit).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/°F/).first()).toBeVisible();
});
