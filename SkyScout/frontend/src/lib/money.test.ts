import { describe, expect, it } from "vitest";

import { estimateTotal, formatMoney, toNumber } from "./money";

describe("money", () => {
  it("formats a numeric string as currency", () => {
    expect(formatMoney("188.00", "USD", "en-US")).toBe("$188.00");
  });

  it("formats a raw number as currency (wire sends numbers)", () => {
    expect(formatMoney(188, "USD", "en-US")).toBe("$188.00");
  });

  it("coerces string or number via toNumber", () => {
    expect(toNumber("42.50")).toBe(42.5);
    expect(toNumber(42.5)).toBe(42.5);
  });

  it("estimates a total without floating-point drift", () => {
    expect(estimateTotal("0.10", 3)).toBe(0.3);
    expect(estimateTotal(188, 2)).toBe(376);
  });

  it("falls back gracefully for non-numeric input", () => {
    expect(formatMoney("abc", "USD")).toBe("abc");
  });
});
