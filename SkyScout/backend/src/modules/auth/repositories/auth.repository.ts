import { eq } from "drizzle-orm";

import { db, type Executor } from "../../../infra/db/client.js";
import { users } from "../../../infra/db/schema.js";

export function create(values: { email: string; passwordHash: string }, ex: Executor = db) {
  return ex.insert(users).values(values).returning();
}

export function findByEmail(email: string, ex: Executor = db) {
  return ex.select().from(users).where(eq(users.email, email)).limit(1);
}

export function findById(id: string, ex: Executor = db) {
  return ex.select().from(users).where(eq(users.id, id)).limit(1);
}
