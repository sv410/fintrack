import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createNeonDb(connectionString: string) {
  return drizzle(neon(connectionString), { schema });
}
