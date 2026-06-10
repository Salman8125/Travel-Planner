import { describe, expect, it } from "vitest";

import { add, isNonNegative, mul, toMoney } from "../../src/shared/money.js";

describe("money", () => {
  it("toMoney formats to 2 decimals", () => {
    expect(toMoney("5")).toBe("5.00");
    expect(toMoney(5)).toBe("5.00");
    expect(toMoney("5.1")).toBe("5.10");
    expect(toMoney("5.125")).toBe("5.13");
  });

  it("mul has no float drift", () => {
    expect(mul("0.1", 3)).toBe("0.30");
    expect(mul("278.00", 2)).toBe("556.00");
    expect(mul("200.00", 0)).toBe("0.00");
  });

  it("add is exact", () => {
    expect(add("0.1", "0.2")).toBe("0.30");
    expect(add("100.50", "0.50")).toBe("101.00");
  });

  it("isNonNegative", () => {
    expect(isNonNegative("0.00")).toBe(true);
    expect(isNonNegative("1.00")).toBe(true);
    expect(isNonNegative("-1")).toBe(false);
  });
});
