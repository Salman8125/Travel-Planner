import { test, expect } from '@playwright/test';

test('register, create a budget, and record an expense', async ({ page }) => {
  const email = `e2e-${Date.now()}@pennypilot.dev`;

  // Register
  await page.goto('/register');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill('e2e-password-123');
  await page.getByRole('button', { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/budgets/);

  // Create a budget
  await page.getByRole('link', { name: /new budget/i }).first().click();
  await expect(page).toHaveURL(/\/budgets\/new/);
  await page.getByLabel(/name/i).fill('E2E Budget');
  await page.getByLabel(/total amount/i).fill('500.00');
  await page.getByLabel(/start date/i).fill('2026-06-01');
  await page.getByRole('button', { name: /create budget/i }).click();

  // Land on the budget detail
  await expect(page.getByRole('heading', { name: 'E2E Budget' })).toBeVisible();
  await expect(page.getByText('$500.00').first()).toBeVisible();

  // Record an expense
  await page.getByRole('link', { name: /record expense/i }).first().click();
  await expect(page).toHaveURL(/\/expenses\/new/);
  await page.getByLabel(/amount/i).fill('120.00');
  await page.getByLabel(/^date/i).fill('2026-06-05');
  // Live check preview should appear
  await expect(page.getByText(/leaves/i)).toBeVisible();
  await page.getByRole('button', { name: /record expense/i }).click();

  // Expense appears in the list
  await expect(page).toHaveURL(/\/expenses$/);
  await expect(page.getByText('$120.00').first()).toBeVisible();
});
