import { describe, expect, it } from 'vitest';
import { formatDay, tripSpanDays, datePart } from './date';
import { formatMoney } from './money';
import { signature } from './signature';

describe('date utils', () => {
  it('formats a calendar date without a timezone shift', () => {
    expect(formatDay('2027-07-01', 'yyyy-MM-dd')).toBe('2027-07-01');
  });

  it('counts inclusive trip span days', () => {
    expect(tripSpanDays('2027-07-01', '2027-07-03')).toBe(3);
    expect(tripSpanDays('2027-07-01', '2027-07-01')).toBe(1);
  });

  it('extracts the date part of a datetime', () => {
    expect(datePart('2027-07-01T10:00')).toBe('2027-07-01');
  });
});

describe('money utils', () => {
  it('formats with the API currency code', () => {
    expect(formatMoney(1282, 'USD')).toMatch(/\$1,282/);
  });

  it('renders a dash for nullish values', () => {
    expect(formatMoney(null)).toBe('—');
  });
});

describe('signature', () => {
  it('is stable regardless of key order', () => {
    expect(signature({ a: 1, b: 2 })).toBe(signature({ b: 2, a: 1 }));
  });

  it('differs when values change', () => {
    expect(signature({ a: 1 })).not.toBe(signature({ a: 2 }));
  });
});
