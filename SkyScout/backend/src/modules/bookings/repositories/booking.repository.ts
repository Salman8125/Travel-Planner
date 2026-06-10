import { desc, eq, sql, type SQL } from "drizzle-orm";

import { db, type Executor } from "../../../infra/db/client.js";
import { bookings, passengers } from "../../../infra/db/schema.js";
import type { BookingStatus } from "../../../shared/enums.js";
import { ConflictError } from "../../../shared/errors.js";
import { generatePnr } from "../../../shared/pnr.js";

export class IdempotencyConflict extends Error {}

type NewBooking = typeof bookings.$inferInsert;

export async function insertWithPnrRetry(values: Omit<NewBooking, "reference">, ex: Executor): Promise<{ id: string }> {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const [created] = await ex
        .insert(bookings)
        .values({ ...values, reference: generatePnr() })
        .returning({ id: bookings.id });
      return { id: created.id };
    } catch (err) {
      const e = err as { code?: string; constraint_name?: string };
      if (e.code === "23505") {
        if (e.constraint_name === "uq_bookings_idempotency_key") throw new IdempotencyConflict();
        continue;
      }
      throw err;
    }
  }
  throw new ConflictError("Could not allocate a booking reference", "pnr_exhausted");
}

export function findByReference(reference: string, ex: Executor = db) {
  return ex.query.bookings.findFirst({ where: eq(bookings.reference, reference), with: { passengers: true } });
}

export function findByIdempotencyKey(key: string, ex: Executor = db) {
  return ex.query.bookings.findFirst({ where: eq(bookings.idempotencyKey, key), with: { passengers: true } });
}

export function findByIdWithPassengers(id: string, ex: Executor = db) {
  return ex.query.bookings.findFirst({ where: eq(bookings.id, id), with: { passengers: true } });
}

export async function listWithCount(where: SQL | undefined, page: number, pageSize: number, ex: Executor = db) {
  const [{ total }] = await ex.select({ total: sql<number>`count(*)::int` }).from(bookings).where(where);
  const rows = await ex.query.bookings.findMany({
    where,
    with: { passengers: true },
    orderBy: [desc(bookings.createdAt)],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return { rows, total };
}

export function updateStatus(id: string, status: BookingStatus, ex: Executor = db) {
  return ex.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, id));
}

export function lockByReference(reference: string, ex: Executor) {
  return ex
    .select({
      id: bookings.id,
      userId: bookings.userId,
      flightId: bookings.flightId,
      cabin: bookings.cabin,
      status: bookings.status,
    })
    .from(bookings)
    .where(eq(bookings.reference, reference))
    .for("update")
    .limit(1);
}

export async function countPassengers(bookingId: string, ex: Executor): Promise<number> {
  const [{ total }] = await ex
    .select({ total: sql<number>`count(*)::int` })
    .from(passengers)
    .where(eq(passengers.bookingId, bookingId));
  return total;
}

export function cancelByIdReturning(id: string, ex: Executor) {
  const now = new Date();
  return ex.update(bookings).set({ status: "CANCELLED", cancelledAt: now, updatedAt: now }).where(eq(bookings.id, id));
}

export type BookingWithPassengers = NonNullable<Awaited<ReturnType<typeof findByIdWithPassengers>>>;
