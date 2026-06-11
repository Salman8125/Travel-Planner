import { http, unwrap, unwrapList } from "@/lib/apiClient";
import type { Airline, Airport, PaginationMeta } from "@/types/app";

export function listAirports(page = 1, pageSize = 100): Promise<{ data: Airport[]; meta: PaginationMeta }> {
  return unwrapList<Airport>(http.get("/api/airports", { params: { page, pageSize } }));
}

export function listAirlines(page = 1, pageSize = 100): Promise<{ data: Airline[]; meta: PaginationMeta }> {
  return unwrapList<Airline>(http.get("/api/airlines", { params: { page, pageSize } }));
}

export function createAirport(input: Omit<Airport, "id">): Promise<Airport> {
  return unwrap<Airport>(http.post("/api/airports", input));
}

export function updateAirport(
  id: string,
  input: Partial<Omit<Airport, "id" | "iataCode">>,
): Promise<Airport> {
  return unwrap<Airport>(http.patch(`/api/airports/${id}`, input));
}

export function deleteAirport(id: string): Promise<void> {
  return http.delete(`/api/airports/${id}`).then(() => undefined);
}

export function createAirline(input: Omit<Airline, "id">): Promise<Airline> {
  return unwrap<Airline>(http.post("/api/airlines", input));
}

export function updateAirline(id: string, input: { name: string }): Promise<Airline> {
  return unwrap<Airline>(http.patch(`/api/airlines/${id}`, input));
}

export function deleteAirline(id: string): Promise<void> {
  return http.delete(`/api/airlines/${id}`).then(() => undefined);
}
