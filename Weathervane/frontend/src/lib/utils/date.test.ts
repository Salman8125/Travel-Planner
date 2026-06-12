import { describe, expect, it } from "vitest";

import { formatForecastDate, formatInLocation, spanDays } from "./date";

describe("formatForecastDate", () => {
  it("renders a bare date as its own calendar day without a UTC shift", () => {
    expect(formatForecastDate("2026-03-01", "yyyy-MM-dd")).toBe("2026-03-01");
    expect(formatForecastDate("2026-12-31", "yyyy-MM-dd")).toBe("2026-12-31");
  });
});

describe("formatInLocation", () => {
  it("renders an instant in the location's IANA timezone", () => {
    const instant = "2026-06-12T00:30:00Z";
    expect(formatInLocation(instant, "Asia/Tokyo", "yyyy-MM-dd HH:mm")).toBe("2026-06-12 09:30");
    expect(formatInLocation(instant, "America/New_York", "yyyy-MM-dd HH:mm")).toBe(
      "2026-06-11 20:30",
    );
  });
});

describe("spanDays", () => {
  it("is inclusive of both endpoints", () => {
    expect(spanDays("2026-06-01", "2026-06-01")).toBe(1);
    expect(spanDays("2026-06-01", "2026-06-16")).toBe(16);
  });
});
