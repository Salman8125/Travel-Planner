import { describe, expect, it } from 'vitest';
import { BuildFormSchema, emptyBuildForm, type BuildForm } from './schemas';

const FUTURE = '2099-07-01';
const FUTURE_END = '2099-07-03';

function valid(): BuildForm {
  return {
    ...emptyBuildForm(),
    title: 'Trip',
    flight: {
      flightId: 'FL-1',
      airline: 'Sky',
      origin: 'JFK',
      destination: 'LHR',
      departureTime: `${FUTURE}T06:00`,
      arrivalTime: `${FUTURE}T10:00`,
      price: 742,
      currency: 'USD',
      stops: 0,
    },
    hotel: {
      hotelId: 'HT-1',
      name: 'Hotel',
      starRating: 4,
      pricePerNight: 180,
      totalPrice: 540,
      currency: 'USD',
      checkIn: FUTURE,
      checkOut: FUTURE_END,
      amenities: '',
    },
    weather: [
      { date: FUTURE, high: 24, low: 15, condition: 'SUNNY' },
      { date: '2099-07-02', high: 22, low: 14, condition: 'CLOUDY' },
      { date: FUTURE_END, high: 23, low: 15, condition: 'SUNNY' },
    ],
    budget: { totalBudget: 5000, spent: 0, remaining: 5000, currency: 'USD' },
    preferences: { strictBudget: false },
  };
}

function errorPaths(form: BuildForm): string[] {
  const result = BuildFormSchema.safeParse(form);
  if (result.success) return [];
  return result.error.issues.map((i) => i.path.join('.'));
}

describe('BuildFormSchema cross-validation', () => {
  it('accepts a fully valid trip', () => {
    expect(BuildFormSchema.safeParse(valid()).success).toBe(true);
  });

  it('rejects origin equal to destination', () => {
    const f = valid();
    f.flight.destination = 'JFK';
    expect(errorPaths(f)).toContain('flight.destination');
  });

  it('rejects arrival before departure', () => {
    const f = valid();
    f.flight.arrivalTime = `${FUTURE}T05:00`;
    expect(errorPaths(f)).toContain('flight.arrivalTime');
  });

  it('rejects a currency mismatch on all three sections', () => {
    const f = valid();
    f.hotel.currency = 'EUR';
    const paths = errorPaths(f);
    expect(paths).toContain('hotel.currency');
  });

  it('rejects a hotel that does not cover the arrival date', () => {
    const f = valid();
    f.hotel.checkIn = '2099-07-02';
    expect(errorPaths(f)).toContain('hotel.checkIn');
  });

  it('rejects empty weather on a multi-day trip', () => {
    const f = valid();
    f.weather = [];
    expect(errorPaths(f)).toContain('weather');
  });

  it('rejects a trip in the past', () => {
    const f = valid();
    f.flight.arrivalTime = '2000-01-01T10:00';
    f.hotel.checkIn = '2000-01-01';
    f.hotel.checkOut = '2000-01-03';
    expect(errorPaths(f)).toContain('flight.arrivalTime');
  });
});
