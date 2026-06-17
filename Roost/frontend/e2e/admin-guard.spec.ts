import { expect, test } from '@playwright/test';

test('a guest visiting /admin is redirected to login with returnTo', async ({ page }) => {
  await page.goto('/admin/hotels');
  await expect(page).toHaveURL(/\/login\?returnTo=/);
});

test('a non-admin user is shown the 403 page on /admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@roost.dev');
  await page.getByLabel('Password').fill('user12345');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('link', { name: /my bookings/i })).toBeVisible({ timeout: 15_000 });

  await page.goto('/admin/hotels');
  await expect(page).toHaveURL(/\/403/);
});
