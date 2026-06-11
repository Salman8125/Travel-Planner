import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

import * as bookingsApi from "./api";

export function useBookings(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: queryKeys.bookings.list(page, pageSize),
    queryFn: () => bookingsApi.listBookings(page, pageSize),
    placeholderData: keepPreviousData,
  });
}

export function useBooking(reference: string | undefined) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(reference ?? ""),
    queryFn: () => bookingsApi.getBooking(reference as string),
    enabled: !!reference,
  });
}
