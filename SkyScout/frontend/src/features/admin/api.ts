import { http, unwrap } from "@/lib/apiClient";
import type { Cabin, FlightStatus, FlightSummary } from "@/types/app";

export interface CreateFlightInput {
  flightNumber: string;
  airlineIata: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  cabins: Array<{ cabin: Cabin; totalSeats: number; basePrice: string; currency: string }>;
}

export function createFlight(input: CreateFlightInput): Promise<FlightSummary> {
  return unwrap<FlightSummary>(http.post("/api/flights", input));
}

export function setFlightStatus(id: string, status: FlightStatus): Promise<FlightSummary> {
  return unwrap<FlightSummary>(http.patch(`/api/flights/${id}/status`, { status }));
}

export function deleteFlight(id: string): Promise<void> {
  return http.delete(`/api/flights/${id}`).then(() => undefined);
}
