import { describe, expect, it } from "vitest";

import { durationMinutes, fromPrice, toSummary } from "../../src/modules/flights/mappers/flight.mapper.js";
import type { FlightRow } from "../../src/modules/flights/repositories/flight.repository.js";

const row = {
  id: "f1",
  flightNumber: "ZZ1",
  airline: { iataCode: "ZZ", name: "Zeta" },
  origin: { iataCode: "AAA", city: "Alpha", timezone: "UTC" },
  destination: { iataCode: "BBB", city: "Beta", timezone: "UTC" },
  scheduledDeparture: new Date("2026-07-01T08:00:00Z"),
  scheduledArrival: new Date("2026-07-01T11:30:00Z"),
  status: "SCHEDULED",
  cabinInventory: [
    { cabin: "ECONOMY", basePrice: "200.00", currency: "USD", availableSeats: 5, totalSeats: 50 },
    { cabin: "BUSINESS", basePrice: "600.00", currency: "USD", availableSeats: 0, totalSeats: 10 },
  ],
} as unknown as FlightRow;

describe("flight.mapper", () => {
  it("durationMinutes", () => {
    expect(durationMinutes(row.scheduledDeparture, row.scheduledArrival)).toBe(210);
  });

  it("toSummary maps fields + cabins and ISO dates", () => {
    const s = toSummary(row);
    expect(s.flightNumber).toBe("ZZ1");
    expect(s.airline.iataCode).toBe("ZZ");
    expect(s.durationMinutes).toBe(210);
    expect(s.cabins).toHaveLength(2);
    expect(s.scheduledDeparture).toBe("2026-07-01T08:00:00.000Z");
  });

  it("fromPrice returns the cheapest cabin with availability", () => {
    expect(fromPrice(row)).toBe("200.00");
    expect(fromPrice(row, "ECONOMY")).toBe("200.00");
    expect(fromPrice(row, "BUSINESS")).toBeNull();
  });
});
