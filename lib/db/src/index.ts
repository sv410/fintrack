import type pg from "pg";
import { createNeonDb } from "./neon-db";
import { createPgDb } from "./pg-db";

export * from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const useNeon = Boolean(process.env.VERCEL);

const pgResult = useNeon ? null : createPgDb(connectionString);

export const db = useNeon
  ? createNeonDb(connectionString)
  : pgResult!.db;

export const pool: pg.Pool | undefined = pgResult?.pool;
