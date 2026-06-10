import { eq } from "drizzle-orm";

import { config } from "../../../config/env.js";
import { db } from "../../../infra/db/client.js";
import { bookings } from "../../../infra/db/schema.js";
import { UNBOOKABLE_FLIGHT_STATUS } from "../../../shared/enums.js";
import type { Cabin, FlightStatus } from "../../../shared/enums.js";
import { ConflictError, NotFoundError, PaymentError, ValidationError } from "../../../shared/errors.js";
import * as money from "../../../shared/money.js";
import type { PaginationMeta } from "../../../shared/pagination.js";
import * as flightRepository from "../../flights/repositories/flight.repository.js";
import * as payment from "../../payments/services/payment.service.js";
import { mapBooking } from "../mappers/booking.mapper.js";
import * as bookingRepository from "../repositories/booking.repository.js";
import { IdempotencyConflict } from "../repositories/booking.repository.js";
import * as cabinInventoryRepository from "../../flights/repositories/cabinInventory.repository.js";
import * as passengerRepository from "../repositories/passenger.repository.js";
import type { BookingDTO, CallerContext, CancelResult, CreateBookingInput, CreateBookingResult, PassengerInput } from "../types/booking.types.js";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function validatePassengers(list: PassengerInput[]): void {
  if (list.length <= 0) throw new ValidationError("At least one passenger is required");
  if (list.length > config.MAX_PASSENGERS_PER_BOOKING) {
    throw new ConflictError(`At most ${config.MAX_PASSENGERS_PER_BOOKING} passengers per booking`, "too_many_passengers");
  }
  const now = Date.now();
  for (const p of list) {
    if (!p.firstName.trim() || !p.lastName.trim()) throw new ValidationError("Passenger names are required");
    const dob = new Date(p.dateOfBirth).getTime();
    if (Number.isNaN(dob) || dob >= now) throw new ValidationError("Passenger dateOfBirth must be a valid past date");
    const age = (now - dob) / MS_PER_YEAR;
    if (p.type === "INFANT" && age >= 2) throw new ValidationError("INFANT passengers must be under 2 years old");
    if (p.type === "CHILD" && (age < 2 || age >= 12)) throw new ValidationError("CHILD passengers must be 2–11 years old");
    if (p.type === "ADULT" && age < 12) throw new ValidationError("ADULT passengers must be 12 years or older");
  }
}

export async function createBooking(input: CreateBookingInput, ctx: { userId: string; idempotencyKey?: string }): Promise<CreateBookingResult> {
  validatePassengers(input.passengers);
  const n = input.passengers.length;

  if (ctx.idempotencyKey) {
    const existing = await bookingRepository.findByIdempotencyKey(ctx.idempotencyKey);
    if (existing) return { booking: mapBooking(existing), replayed: true };
  }

  let createdId: string;
  try {
    createdId = await db.transaction(async (tx) => {
      const [inv] = await cabinInventoryRepository.lockByFlightAndCabin(input.flightId, input.cabin, tx);
      if (!inv) throw new NotFoundError("Flight cabin not found");

      const [flight] = await flightRepository.findRawById(input.flightId, tx);
      if (!flight || flight.deletedAt) throw new NotFoundError("Flight not found");
      if (UNBOOKABLE_FLIGHT_STATUS.includes(flight.status as FlightStatus)) {
        throw new ConflictError("Flight is not bookable", "flight_not_bookable");
      }
      if (inv.availableSeats < n) {
        throw new ConflictError("Insufficient seats available", "insufficient_seats");
      }

      const total = money.mul(inv.basePrice, n);
      await cabinInventoryRepository.decrement(inv.id, n, tx);

      const { id } = await bookingRepository.insertWithPnrRetry(
        {
          userId: ctx.userId,
          flightId: input.flightId,
          cabin: input.cabin,
          status: "PENDING",
          totalPrice: total,
          currency: inv.currency,
          contactEmail: input.contactEmail,
          idempotencyKey: ctx.idempotencyKey ?? null,
        },
        tx,
      );

      await passengerRepository.insertMany(
        input.passengers.map((p) => ({
          bookingId: id,
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth,
          type: p.type,
          passportNumber: p.passportNumber ?? null,
        })),
        tx,
      );

      return id;
    });
  } catch (err) {
    if (err instanceof IdempotencyConflict && ctx.idempotencyKey) {
      const existing = await bookingRepository.findByIdempotencyKey(ctx.idempotencyKey);
      if (existing) return { booking: mapBooking(existing), replayed: true };
      throw new ConflictError("Idempotency key conflict", "idempotency_conflict");
    }
    throw err;
  }

  const pending = await bookingRepository.findByIdWithPassengers(createdId);
  if (!pending) throw new NotFoundError("Booking not found");

  const result = payment.charge({
    amount: pending.totalPrice,
    currency: pending.currency,
    reference: pending.reference,
    contactEmail: pending.contactEmail,
  });

  if (result.success) {
    await bookingRepository.updateStatus(createdId, "CONFIRMED");
    const confirmed = await bookingRepository.findByIdWithPassengers(createdId);
    return { booking: mapBooking(confirmed!), replayed: false };
  }

  await db.transaction(async (tx) => {
    await cabinInventoryRepository.lockByFlightAndCabin(pending.flightId, pending.cabin as Cabin, tx);
    await cabinInventoryRepository.increment(pending.flightId, pending.cabin as Cabin, n, tx);
    await bookingRepository.updateStatus(createdId, "FAILED", tx);
  });
  throw new PaymentError("Payment was declined");
}

export async function getByReference(reference: string, ctx: CallerContext): Promise<BookingDTO> {
  const row = await bookingRepository.findByReference(reference.toUpperCase());
  if (!row) throw new NotFoundError("Booking not found");
  if (ctx.role !== "ADMIN" && row.userId !== ctx.userId) {
    throw new NotFoundError("Booking not found");
  }
  return mapBooking(row);
}

export async function list(ctx: CallerContext, page: number, pageSize: number): Promise<{ data: BookingDTO[]; meta: PaginationMeta }> {
  const where = ctx.role === "ADMIN" ? undefined : eq(bookings.userId, ctx.userId);
  const { rows, total } = await bookingRepository.listWithCount(where, page, pageSize);
  return {
    data: rows.map(mapBooking),
    meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function cancel(reference: string, ctx: CallerContext): Promise<CancelResult> {
  const ref = reference.toUpperCase();
  const pre = await bookingRepository.findByReference(ref);
  if (!pre) throw new NotFoundError("Booking not found");
  if (ctx.role !== "ADMIN" && pre.userId !== ctx.userId) throw new NotFoundError("Booking not found");

  const outcome = await db.transaction(async (tx) => {
    await cabinInventoryRepository.lockByFlightAndCabin(pre.flightId, pre.cabin as Cabin, tx);
    const [b] = await bookingRepository.lockByReference(ref, tx);
    if (!b) throw new NotFoundError("Booking not found");
    if (ctx.role !== "ADMIN" && b.userId !== ctx.userId) throw new NotFoundError("Booking not found");

    if (b.status === "CANCELLED") return { id: b.id, alreadyCancelled: true };
    if (b.status === "FAILED") throw new ConflictError("Booking is not active", "not_cancellable");

    const [flight] = await flightRepository.findRawById(b.flightId, tx);
    if (!flight) throw new NotFoundError("Flight not found");
    if (flight.status === "DEPARTED" || flight.status === "ARRIVED") {
      throw new ConflictError("Flight has already departed", "flight_departed");
    }
    const cutoffMs = flight.scheduledDeparture.getTime() - config.CANCELLATION_CUTOFF_HOURS * 3_600_000;
    if (Date.now() > cutoffMs) {
      throw new ConflictError("Cancellation window has closed", "cancellation_window_closed");
    }

    const n = await bookingRepository.countPassengers(b.id, tx);
    await bookingRepository.cancelByIdReturning(b.id, tx);
    await cabinInventoryRepository.increment(b.flightId, b.cabin as Cabin, n, tx);
    return { id: b.id, alreadyCancelled: false };
  });

  const fresh = await bookingRepository.findByIdWithPassengers(outcome.id);
  if (!fresh) throw new NotFoundError("Booking not found");
  return { booking: mapBooking(fresh), alreadyCancelled: outcome.alreadyCancelled };
}
