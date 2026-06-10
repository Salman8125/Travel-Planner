import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { drizzle, type PostgresJsDatabase, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { config } from "../../config/env.js";
import * as schema from "./schema.js";

export const sql = postgres(config.DATABASE_URL, { max: 30, onnotice: () => {} });
export const db = drizzle(sql, { schema });
export type DB = typeof db;

type Schema = typeof schema;
type Tx = PgTransaction<PostgresJsQueryResultHKT, Schema, ExtractTablesWithRelations<Schema>>;

export type Executor = PostgresJsDatabase<Schema> | Tx;
