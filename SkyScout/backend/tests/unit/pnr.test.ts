import { describe, expect, it } from "vitest";

import { generatePnr } from "../../src/shared/pnr.js";

describe("pnr", () => {
  it("is 6 chars from an unambiguous alphabet (no I/O/0/1)", () => {
    for (let i = 0; i < 500; i++) {
      expect(generatePnr()).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    }
  });

  it("is reasonably unique", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) seen.add(generatePnr());
    expect(seen.size).toBeGreaterThan(990);
  });
});
