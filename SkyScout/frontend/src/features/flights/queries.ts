import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

import * as flightsApi from "./api";
import type { SearchInput } from "./schemas";

export function useFlightSearch(input: SearchInput | null) {
  return useQuery({
    queryKey: input ? queryKeys.flights.search(input) : ["flights", "search", "idle"],
    queryFn: () => flightsApi.searchFlights(input as SearchInput),
    enabled: !!input,
    placeholderData: keepPreviousData,
  });
}

export function useFlight(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.flights.detail(id ?? ""),
    queryFn: () => flightsApi.getFlight(id as string),
    enabled: !!id,
  });
}
