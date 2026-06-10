import path from "node:path";
import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, sql } from "./client.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(here, "../../../drizzle");

async function main() {
  console.log(`[skyscout] running migrations from ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.log("[skyscout] migrations complete");
  await sql.end();
}

main().catch((err) => {
  console.error("[skyscout] migration failed:", err);
  process.exit(1);
});
