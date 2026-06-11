import { toNumber } from "@/lib/money";
import type { Cabin, CabinAvailability, FlightSummary } from "@/types/app";

export function lowestFare(flight: FlightSummary, cabin?: Cabin): CabinAvailability | null {
  const cabins = flight.cabins.filter((c) => c.availableSeats > 0 && (!cabin || c.cabin === cabin));
  if (cabins.length === 0) return null;
  return cabins.reduce((min, c) => (toNumber(c.basePrice) < toNumber(min.basePrice) ? c : min), cabins[0]);
}

export function totalSeatsAvailable(flight: FlightSummary): number {
  return flight.cabins.reduce((sum, c) => sum + c.availableSeats, 0);
}

export function isBookable(flight: FlightSummary): boolean {
  const unbookable: FlightSummary["status"][] = ["CANCELLED", "DEPARTED", "ARRIVED"];
  return !unbookable.includes(flight.status) && totalSeatsAvailable(flight) > 0;
}
