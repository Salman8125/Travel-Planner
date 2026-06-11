import { expect, test } from "@playwright/test";

function futureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function selectFromCombobox(page: import("@playwright/test").Page, label: string, optionText: RegExp) {
  await page.getByLabel(label, { exact: true }).click();
  await page.getByRole("option", { name: optionText }).click();
}

test("register, search, book, and cancel a flight", async ({ page }) => {
  const email = `e2e.${Date.now()}@skyscout.dev`;
  const departureDate = futureDate(7);

  // --- Register (auto signs in) ---
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByRole("heading", { name: /find your flight/i })).toBeVisible();

  // --- Search ISB -> DXB ---
  await selectFromCombobox(page, "From", /Islamabad \(ISB\)/);
  await selectFromCombobox(page, "To", /Dubai \(DXB\)/);
  await page.getByLabel("Departure").fill(departureDate);
  await page.getByRole("button", { name: /^search$/i }).click();

  // First result -> details
  await page.getByRole("link", { name: /^view$/i }).first().click();
  await expect(page.getByRole("heading", { name: /select a cabin/i })).toBeVisible();

  // --- Booking wizard ---
  await page.getByRole("radio", { name: /economy/i }).click();
  await page.getByRole("button", { name: /continue to booking/i }).click();

  // Step: Cabin (pre-selected) -> Continue
  await page.getByRole("button", { name: /^continue$/i }).click();

  // Step: Passengers
  await page.getByLabel("First name").fill("Ada");
  await page.getByLabel("Last name").fill("Lovelace");
  await page.getByLabel("Date of birth").fill("1990-01-01");
  await page.getByRole("button", { name: /^continue$/i }).click();

  // Step: Review -> payment
  await page.getByRole("button", { name: /continue to payment/i }).click();

  // Step: Payment
  await page.getByRole("button", { name: /^pay /i }).click();

  // Confirmation
  await expect(page.getByRole("heading", { name: /booking confirmed/i })).toBeVisible();
  const pnr = (await page.getByText(/^[A-Z0-9]{6}$/).first().textContent())?.trim() ?? "";
  expect(pnr).toMatch(/^[A-Z0-9]{6}$/);

  await page.getByRole("button", { name: /view booking/i }).click();
  // exact match avoids colliding with the lingering "Booking confirmed — <PNR>" toast.
  await expect(page.getByText(pnr, { exact: true })).toBeVisible();

  // --- My Bookings list ---
  await page.getByRole("link", { name: /my bookings/i }).first().click();
  await expect(page.getByRole("link", { name: pnr })).toBeVisible();
  await page.getByRole("link", { name: pnr }).click();

  // --- Cancel ---
  await page.getByRole("button", { name: /cancel booking/i }).click();
  await page.getByRole("button", { name: /yes, cancel/i }).click();
  await expect(page.getByText(/cancelled/i).first()).toBeVisible();
});
