import { and, eq, gte, inArray, isNull, lt, sql } from "drizzle-orm";

import { db, type Executor } from "../../../infra/db/client.js";
import { bookings, flights, passengers } from "../../../infra/db/schema.js";
import type { FlightStatus } from "../../../shared/enums.js";

type NewFlight = typeof flights.$inferInsert;
const ACTIVE_BOOKING_STATUS = ["PENDING", "CONFIRMED"] as const;

export function findForRoute(originId: string, destinationId: string, dayStart: Date, dayEnd: Date, ex: Executor = db) {
  return ex.query.flights.findMany({
    where: and(
      eq(flights.originId, originId),
      eq(flights.destinationId, destinationId),
      isNull(flights.deletedAt),
      gte(flights.scheduledDeparture, dayStart),
      lt(flights.scheduledDeparture, dayEnd),
    ),
    with: { airline: true, origin: true, destination: true, cabinInventory: true },
  });
}

export function findById(id: string, ex: Executor = db) {
  return ex.query.flights.findFirst({
    where: and(eq(flights.id, id), isNull(flights.deletedAt)),
    with: { airline: true, origin: true, destination: true, cabinInventory: true },
  });
}

export function findRawById(id: string, ex: Executor = db) {
  return ex.select().from(flights).where(eq(flights.id, id)).limit(1);
}

export function insertFlight(values: NewFlight, ex: Executor = db) {
  return ex.insert(flights).values(values).returning({ id: flights.id });
}

export function updateFlight(id: string, patch: Partial<NewFlight>, ex: Executor = db) {
  return ex
    .update(flights)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(flights.id, id), isNull(flights.deletedAt)))
    .returning({ id: flights.id });
}

export function setStatus(id: string, status: FlightStatus, ex: Executor = db) {
  return ex
    .update(flights)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(flights.id, id), isNull(flights.deletedAt)))
    .returning({ id: flights.id });
}

export function softDelete(id: string, ex: Executor = db) {
  const now = new Date();
  return ex
    .update(flights)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(eq(flights.id, id), isNull(flights.deletedAt)))
    .returning({ id: flights.id });
}

export function lockActiveBookingsByFlight(flightId: string, ex: Executor) {
  return ex
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.flightId, flightId), inArray(bookings.status, [...ACTIVE_BOOKING_STATUS])))
    .for("update")
    .orderBy(bookings.id);
}

export function seatReleaseByCabin(flightId: string, ex: Executor) {
  return ex
    .select({ cabin: bookings.cabin, seats: sql<number>`count(${passengers.id})::int` })
    .from(bookings)
    .innerJoin(passengers, eq(passengers.bookingId, bookings.id))
    .where(and(eq(bookings.flightId, flightId), inArray(bookings.status, [...ACTIVE_BOOKING_STATUS])))
    .groupBy(bookings.cabin);
}

export async function countActiveBookings(flightId: string, ex: Executor = db): Promise<number> {
  const [{ total }] = await ex
    .select({ total: sql<number>`count(*)::int` })
    .from(bookings)
    .where(and(eq(bookings.flightId, flightId), inArray(bookings.status, [...ACTIVE_BOOKING_STATUS])));
  return total;
}

export function cancelActiveBookingsByFlight(flightId: string, ex: Executor) {
  const now = new Date();
  return ex
    .update(bookings)
    .set({ status: "CANCELLED", cancelledAt: now, updatedAt: now })
    .where(and(eq(bookings.flightId, flightId), inArray(bookings.status, [...ACTIVE_BOOKING_STATUS])));
}

export type FlightRow = Awaited<ReturnType<typeof findForRoute>>[number];
