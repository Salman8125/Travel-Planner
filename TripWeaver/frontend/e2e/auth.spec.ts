import { expect, test } from '@playwright/test';

test('a new user can register and lands in the app', async ({ page }) => {
  const email = `e2e-${Date.now()}@tripweaver.dev`;
  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/itineraries/);
  await expect(page.getByRole('heading', { name: /my itineraries/i })).toBeVisible();
});

test('seeded user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@tripweaver.dev');
  await page.getByLabel('Password').fill('user12345');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page.getByRole('heading', { name: /my itineraries/i })).toBeVisible();
});

test('protected route redirects guests to login with returnTo', async ({ page }) => {
  await page.goto('/itineraries/new');
  await expect(page).toHaveURL(/\/login\?returnTo=/);
});
