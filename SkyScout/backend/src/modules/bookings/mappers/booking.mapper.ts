import type { BookingStatus, Cabin, PassengerType } from "../../../shared/enums.js";
import type { BookingWithPassengers } from "../repositories/booking.repository.js";
import type { BookingDTO } from "../types/booking.types.js";

export function mapBooking(row: BookingWithPassengers): BookingDTO {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status as BookingStatus,
    flightId: row.flightId,
    cabin: row.cabin as Cabin,
    totalPrice: row.totalPrice,
    currency: row.currency,
    contactEmail: row.contactEmail,
    passengers: row.passengers.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      type: p.type as PassengerType,
      passportNumber: p.passportNumber,
      seatNumber: p.seatNumber,
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    cancelledAt: row.cancelledAt ? row.cancelledAt.toISOString() : null,
  };
}
