import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/lib/ApiError";
import { queryKeys } from "@/lib/queryKeys";
import type { Booking, PaginationMeta } from "@/types/app";

import * as bookingsApi from "./api";
import type { CreateBookingInput } from "./api";

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation<Booking, unknown, { input: CreateBookingInput; idempotencyKey: string }>({
    mutationFn: ({ input, idempotencyKey }) => bookingsApi.createBooking(input, idempotencyKey),
    meta: { suppressGlobalError: true },
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.bookings.detail(booking.reference), booking);
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}

type BookingList = { data: Booking[]; meta: PaginationMeta };

interface CancelContext {
  prevDetail?: Booking;
  listSnapshots: [readonly unknown[], BookingList | undefined][];
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation<Booking, unknown, string, CancelContext>({
    mutationFn: (reference) => bookingsApi.cancelBooking(reference),
    meta: { suppressGlobalError: true },
    onMutate: async (reference) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.detail(reference) });

      const prevDetail = queryClient.getQueryData<Booking>(queryKeys.bookings.detail(reference));
      if (prevDetail) {
        queryClient.setQueryData<Booking>(queryKeys.bookings.detail(reference), {
          ...prevDetail,
          status: "CANCELLED",
          cancelledAt: new Date().toISOString(),
        });
      }

      const listSnapshots = queryClient.getQueriesData<BookingList>({ queryKey: ["bookings", "list"] });
      for (const [key, data] of listSnapshots) {
        if (!data) continue;
        queryClient.setQueryData<BookingList>(key, {
          ...data,
          data: data.data.map((b) => (b.reference === reference ? { ...b, status: "CANCELLED" } : b)),
        });
      }

      return { prevDetail, listSnapshots };
    },
    onError: (error, reference, context) => {
      if (context?.prevDetail) {
        queryClient.setQueryData(queryKeys.bookings.detail(reference), context.prevDetail);
      }
      for (const [key, data] of context?.listSnapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Couldn't cancel the booking.");
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(queryKeys.bookings.detail(booking.reference), booking);
      toast.success("Booking cancelled. Seats released.");
    },
    onSettled: (_booking, _error, reference) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(reference) });
    },
  });
}
