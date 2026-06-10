import { and, eq, sql } from "drizzle-orm";

import { db, type Executor } from "../../../infra/db/client.js";
import { cabinInventory } from "../../../infra/db/schema.js";
import type { Cabin } from "../../../shared/enums.js";

export function lockByFlightAndCabin(flightId: string, cabin: Cabin, ex: Executor) {
  return ex
    .select()
    .from(cabinInventory)
    .where(and(eq(cabinInventory.flightId, flightId), eq(cabinInventory.cabin, cabin)))
    .for("update");
}

export function decrement(id: string, n: number, ex: Executor) {
  return ex
    .update(cabinInventory)
    .set({ availableSeats: sql`${cabinInventory.availableSeats} - ${n}`, updatedAt: new Date() })
    .where(eq(cabinInventory.id, id));
}

export function increment(flightId: string, cabin: Cabin, n: number, ex: Executor) {
  return ex
    .update(cabinInventory)
    .set({ availableSeats: sql`${cabinInventory.availableSeats} + ${n}`, updatedAt: new Date() })
    .where(and(eq(cabinInventory.flightId, flightId), eq(cabinInventory.cabin, cabin)));
}

type NewCabinInventory = typeof cabinInventory.$inferInsert;

export function insertMany(rows: NewCabinInventory[], ex: Executor = db) {
  return ex.insert(cabinInventory).values(rows);
}

export function lockByFlight(flightId: string, ex: Executor) {
  return ex
    .select()
    .from(cabinInventory)
    .where(eq(cabinInventory.flightId, flightId))
    .for("update")
    .orderBy(cabinInventory.id);
}
