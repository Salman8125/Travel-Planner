import { describe, expect, it } from "vitest";

import { parseSearchParams, searchInputToParams } from "./urlState";

describe("flight search URL state", () => {
  it("returns null when required fields are missing", () => {
    expect(parseSearchParams(new URLSearchParams("origin=ISB"))).toBeNull();
  });

  it("parses a full query into a validated SearchInput", () => {
    const params = new URLSearchParams(
      "origin=ISB&destination=DXB&departureDate=2026-06-20&adults=2&children=1&infants=0&cabin=BUSINESS&sortBy=price&order=asc&airlines=EK,QR&priceMax=900&page=2",
    );
    const input = parseSearchParams(params);
    expect(input).not.toBeNull();
    expect(input?.origin).toBe("ISB");
    expect(input?.passengers).toEqual({ adults: 2, children: 1, infants: 0 });
    expect(input?.cabin).toBe("BUSINESS");
    expect(input?.sortBy).toBe("price");
    expect(input?.filters?.airlines).toEqual(["EK", "QR"]);
    expect(input?.filters?.priceMax).toBe("900");
    expect(input?.page).toBe(2);
  });

  it("round-trips through serialization", () => {
    const params = new URLSearchParams(
      "origin=ISB&destination=DXB&departureDate=2026-06-20&adults=1&children=0&infants=0",
    );
    const input = parseSearchParams(params)!;
    const serialized = searchInputToParams(input);
    const reparsed = parseSearchParams(new URLSearchParams(serialized));
    expect(reparsed).toEqual(input);
  });
});
