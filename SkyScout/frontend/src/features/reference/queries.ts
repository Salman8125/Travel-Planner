import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

import * as referenceApi from "./api";

export function useAirports(page = 1, pageSize = 100) {
  return useQuery({
    queryKey: queryKeys.reference.airports(page, pageSize),
    queryFn: () => referenceApi.listAirports(page, pageSize),
    staleTime: 10 * 60_000,
  });
}

export function useAirlines(page = 1, pageSize = 100) {
  return useQuery({
    queryKey: queryKeys.reference.airlines(page, pageSize),
    queryFn: () => referenceApi.listAirlines(page, pageSize),
    staleTime: 10 * 60_000,
  });
}
