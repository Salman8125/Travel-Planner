import { dateFromISO, isoFromDate, isoPlusDays, nights } from './date';

describe('date utils', () => {
  it('serializes a local Date to yyyy-MM-dd with no timezone shift', () => {
    const d = new Date(2026, 6, 1);
    expect(isoFromDate(d)).toBe('2026-07-01');
  });

  it('round-trips ISO -> Date -> ISO', () => {
    expect(isoFromDate(dateFromISO('2026-12-31'))).toBe('2026-12-31');
  });

  it('adds calendar days across a month boundary', () => {
    expect(isoPlusDays('2026-07-30', 3)).toBe('2026-08-02');
  });

  it('counts nights as calendar-day differences', () => {
    expect(nights('2026-07-01', '2026-07-03')).toBe(2);
    expect(nights('2026-07-01', '2026-07-01')).toBe(0);
  });
});
