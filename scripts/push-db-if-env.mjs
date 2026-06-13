import "./load-env.mjs";
import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not set — skipping database schema push.");
  process.exit(0);
}

console.log("Pushing database schema...");
execSync("pnpm --filter @workspace/db run push", { stdio: "inherit" });
