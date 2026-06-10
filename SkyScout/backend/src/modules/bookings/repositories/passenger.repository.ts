import { db, type Executor } from "../../../infra/db/client.js";
import { passengers } from "../../../infra/db/schema.js";

type NewPassenger = typeof passengers.$inferInsert;

export function insertMany(rows: NewPassenger[], ex: Executor = db) {
  return ex.insert(passengers).values(rows);
}
