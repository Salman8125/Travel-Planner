import { describe, expect, it } from 'vitest';
import { difference, formatMoney, percentOf, toNumber } from './money';

describe('money', () => {
  it('coerces decimal strings and numbers', () => {
    expect(toNumber('120.50')).toBe(120.5);
    expect(toNumber(99)).toBe(99);
    expect(toNumber('')).toBe(0);
    expect(toNumber(null)).toBe(0);
    expect(toNumber('not-money')).toBe(0);
  });

  it('formats with the currency code', () => {
    expect(formatMoney('1234.5', 'USD', 'en-US')).toBe('$1,234.50');
    expect(formatMoney(1000, 'EUR', 'en-US')).toBe('€1,000.00');
  });

  it('computes percentage clamped to 0..100', () => {
    expect(percentOf('50', '100')).toBe(50);
    expect(percentOf('150', '100')).toBe(100);
    expect(percentOf('10', '0')).toBe(0);
  });

  it('computes a 2-decimal difference without float drift', () => {
    expect(difference('500.00', '120.10')).toBe(379.9);
    expect(difference('0.30', '0.20')).toBe(0.1);
  });
});
