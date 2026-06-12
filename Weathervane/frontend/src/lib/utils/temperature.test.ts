import { describe, expect, it } from "vitest";

import { cToF, convertTemp, formatTemp } from "./temperature";

describe("temperature", () => {
  it("converts °C to °F", () => {
    expect(cToF(0)).toBe(32);
    expect(cToF(100)).toBe(212);
    expect(cToF(-40)).toBe(-40);
  });

  it("convertTemp leaves °C unchanged and converts to °F on request", () => {
    expect(convertTemp(20, "C")).toBe(20);
    expect(convertTemp(20, "F")).toBe(68);
  });

  it("formats with the unit suffix and an em dash for missing values", () => {
    expect(formatTemp(20, "C")).toBe("20°C");
    expect(formatTemp(20, "F")).toBe("68°F");
    expect(formatTemp(null, "C")).toBe("—");
    expect(formatTemp(undefined, "F")).toBe("—");
  });
});
