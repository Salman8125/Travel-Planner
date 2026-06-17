import { expect, test } from '@playwright/test';

test('a seeded user can sign in and the session persists across reload', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@roost.dev');
  await page.getByLabel('Password').fill('user12345');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page.getByRole('link', { name: /my bookings/i })).toBeVisible({ timeout: 15_000 });

  await page.reload();
  await expect(page.getByRole('link', { name: /my bookings/i })).toBeVisible();
});
