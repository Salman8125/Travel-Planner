import { eq, sql } from "drizzle-orm";

import { db, type Executor } from "../../../infra/db/client.js";
import { airlines, airports } from "../../../infra/db/schema.js";

type NewAirport = typeof airports.$inferInsert;
type NewAirline = typeof airlines.$inferInsert;

export function findAirportIdByIata(code: string, ex: Executor = db) {
  return ex.select({ id: airports.id }).from(airports).where(eq(airports.iataCode, code)).limit(1);
}

export function listAirports(limit: number, offset: number, ex: Executor = db) {
  return ex.select().from(airports).orderBy(airports.iataCode).limit(limit).offset(offset);
}

export async function countAirports(ex: Executor = db): Promise<number> {
  const [{ total }] = await ex.select({ total: sql<number>`count(*)::int` }).from(airports);
  return total;
}

export function findAirportById(id: string, ex: Executor = db) {
  return ex.select().from(airports).where(eq(airports.id, id)).limit(1);
}

export function insertAirport(values: NewAirport, ex: Executor = db) {
  return ex.insert(airports).values(values).returning();
}

export function updateAirport(id: string, patch: Partial<NewAirport>, ex: Executor = db) {
  return ex.update(airports).set(patch).where(eq(airports.id, id)).returning();
}

export function deleteAirport(id: string, ex: Executor = db) {
  return ex.delete(airports).where(eq(airports.id, id)).returning({ id: airports.id });
}

export function findAirlineIdByIata(code: string, ex: Executor = db) {
  return ex.select({ id: airlines.id }).from(airlines).where(eq(airlines.iataCode, code)).limit(1);
}

export function listAirlines(limit: number, offset: number, ex: Executor = db) {
  return ex.select().from(airlines).orderBy(airlines.iataCode).limit(limit).offset(offset);
}

export async function countAirlines(ex: Executor = db): Promise<number> {
  const [{ total }] = await ex.select({ total: sql<number>`count(*)::int` }).from(airlines);
  return total;
}

export function findAirlineById(id: string, ex: Executor = db) {
  return ex.select().from(airlines).where(eq(airlines.id, id)).limit(1);
}

export function insertAirline(values: NewAirline, ex: Executor = db) {
  return ex.insert(airlines).values(values).returning();
}

export function updateAirline(id: string, patch: Partial<NewAirline>, ex: Executor = db) {
  return ex.update(airlines).set(patch).where(eq(airlines.id, id)).returning();
}

export function deleteAirline(id: string, ex: Executor = db) {
  return ex.delete(airlines).where(eq(airlines.id, id)).returning({ id: airlines.id });
}
