import path from "node:path";

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, beforeAll } from "vitest";

import { db, sql } from "../src/infra/db/client.js";

beforeAll(async () => {
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
});

afterAll(async () => {
  await sql.end();
});
