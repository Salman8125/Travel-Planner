import { Decimal } from "decimal.js";

import type { Cabin, FlightStatus } from "../../../shared/enums.js";
import type { FlightRow } from "../repositories/flight.repository.js";
import type { CabinAvailabilityDTO, FlightSummaryDTO } from "../types/flight.types.js";

export function durationMinutes(dep: Date, arr: Date): number {
  return Math.round((arr.getTime() - dep.getTime()) / 60_000);
}

export function toCabin(c: FlightRow["cabinInventory"][number]): CabinAvailabilityDTO {
  return {
    cabin: c.cabin as Cabin,
    basePrice: c.basePrice,
    currency: c.currency,
    availableSeats: c.availableSeats,
    totalSeats: c.totalSeats,
  };
}

export function toSummary(f: FlightRow): FlightSummaryDTO {
  return {
    id: f.id,
    flightNumber: f.flightNumber,
    airline: { iataCode: f.airline.iataCode, name: f.airline.name },
    origin: { iataCode: f.origin.iataCode, city: f.origin.city, timezone: f.origin.timezone },
    destination: { iataCode: f.destination.iataCode, city: f.destination.city, timezone: f.destination.timezone },
    scheduledDeparture: f.scheduledDeparture.toISOString(),
    scheduledArrival: f.scheduledArrival.toISOString(),
    durationMinutes: durationMinutes(f.scheduledDeparture, f.scheduledArrival),
    status: f.status as FlightStatus,
    cabins: f.cabinInventory.map(toCabin),
  };
}

export function fromPrice(f: FlightRow, cabin?: Cabin): string | null {
  const cabins = cabin ? f.cabinInventory.filter((c) => c.cabin === cabin) : f.cabinInventory;
  const available = cabins.filter((c) => c.availableSeats > 0);
  if (available.length === 0) return null;
  return available.reduce((min, c) => (new Decimal(c.basePrice).lt(min) ? c.basePrice : min), available[0].basePrice);
}
