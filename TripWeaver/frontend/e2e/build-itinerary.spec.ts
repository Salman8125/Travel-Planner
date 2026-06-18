import { expect, test } from '@playwright/test';

const inputs = {
  title: 'E2E London Trip',
  destination: 'London',
  flight: {
    flightId: 'FL-1',
    airline: 'Skyline',
    origin: 'JFK',
    destination: 'LHR',
    departureTime: '2099-07-01T06:00',
    arrivalTime: '2099-07-01T10:00',
    price: 742,
    currency: 'USD',
    stops: 0,
  },
  hotel: {
    hotelId: 'HT-1',
    name: 'The Thames View',
    starRating: 4,
    pricePerNight: 180,
    totalPrice: 540,
    currency: 'USD',
    checkIn: '2099-07-01',
    checkOut: '2099-07-03',
    amenities: ['WiFi'],
  },
  weather: [
    { date: '2099-07-01', high: 24, low: 15, condition: 'SUNNY' },
    { date: '2099-07-02', high: 22, low: 14, condition: 'CLOUDY' },
    { date: '2099-07-03', high: 23, low: 15, condition: 'SUNNY' },
  ],
  budget: { totalBudget: 5000, spent: 0, remaining: 5000, currency: 'USD' },
};

test('builds a day-by-day itinerary from the JSON import', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@tripweaver.dev');
  await page.getByLabel('Password').fill('user12345');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page.getByRole('heading', { name: /my itineraries/i })).toBeVisible();

  await page.getByRole('link', { name: /new trip/i }).first().click();
  await expect(page).toHaveURL(/\/itineraries\/new/);

  await page.getByText(/import inputs from json/i).click();
  await page.locator('textarea').fill(JSON.stringify(inputs));
  await page.getByRole('button', { name: /prefill the form/i }).click();

  await page.getByRole('button', { name: /build itinerary/i }).click();

  await expect(page).toHaveURL(/\/itineraries\/[A-Z0-9]{6}/);
  await expect(page.getByRole('heading', { name: 'E2E London Trip' })).toBeVisible();
  await expect(page.getByText(/budget reconciliation/i)).toBeVisible();
  await expect(page.getByText(/day-by-day plan/i)).toBeVisible();
  await expect(page.getByText('Day 1')).toBeVisible();
});
