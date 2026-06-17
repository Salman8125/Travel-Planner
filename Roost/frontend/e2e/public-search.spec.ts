import { expect, test } from '@playwright/test';

test('public search → results → hotel detail, no login required', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('City').fill('London');
  await page.getByRole('button', { name: /search/i }).click();

  await expect(page).toHaveURL(/city=London/i);

  const firstView = page.getByRole('link', { name: 'View' }).first();
  await expect(firstView).toBeVisible({ timeout: 15_000 });
  await firstView.click();

  await expect(page).toHaveURL(/\/hotels\//);
});

test('searching an unknown city shows an empty state, not an error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('City').fill('Nowhereville');
  await page.getByRole('button', { name: /search/i }).click();

  await expect(page).toHaveURL(/city=Nowhereville/i);
  await expect(page.getByText(/no hotels|nothing|no results/i)).toBeVisible({ timeout: 15_000 });
});
