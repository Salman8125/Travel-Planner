import { http, unwrap, unwrapList } from "@/lib/apiClient";
import type { Booking, Cabin, PaginationMeta, PassengerType } from "@/types/app";

export interface CreateBookingInput {
  flightId: string;
  cabin: Cabin;
  contactEmail: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    type: PassengerType;
    passportNumber?: string;
  }>;
}

export function createBooking(input: CreateBookingInput, idempotencyKey: string): Promise<Booking> {
  return unwrap<Booking>(
    http.post("/api/bookings", input, { headers: { "Idempotency-Key": idempotencyKey } }),
  );
}

export function listBookings(
  page = 1,
  pageSize = 10,
): Promise<{ data: Booking[]; meta: PaginationMeta }> {
  return unwrapList<Booking>(http.get("/api/bookings", { params: { page, pageSize } }));
}

export function getBooking(reference: string): Promise<Booking> {
  return unwrap<Booking>(http.get(`/api/bookings/${reference}`));
}

export function cancelBooking(reference: string): Promise<Booking> {
  return unwrap<Booking>(http.post(`/api/bookings/${reference}/cancel`));
}
