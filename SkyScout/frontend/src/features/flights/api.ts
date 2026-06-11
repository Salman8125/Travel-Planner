import { http, unwrap } from "@/lib/apiClient";
import type { FlightSearchResult, FlightSummary } from "@/types/app";

import type { SearchInput } from "./schemas";

export function searchFlights(input: SearchInput): Promise<FlightSearchResult> {
  return unwrap<FlightSearchResult>(http.post("/api/flights/search", input));
}

export function getFlight(id: string): Promise<FlightSummary> {
  return unwrap<FlightSummary>(http.get(`/api/flights/${id}`));
}
