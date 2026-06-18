import { expect, test } from '@playwright/test';

test('a USER is forbidden from the admin area', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@tripweaver.dev');
  await page.getByLabel('Password').fill('user12345');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('heading', { name: /my itineraries/i })).toBeVisible();

  // No admin link for a USER.
  await expect(page.getByRole('link', { name: /^admin$/i })).toHaveCount(0);

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/403/);
  await expect(page.getByRole('heading', { name: /access denied/i })).toBeVisible();
});

test('an ADMIN sees the oversight grid', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@tripweaver.dev');
  await page.getByLabel('Password').fill('admin12345');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page.getByRole('link', { name: /^admin$/i })).toBeVisible();
  await page.getByRole('link', { name: /^admin$/i }).click();
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole('heading', { name: /all itineraries/i })).toBeVisible();
});
