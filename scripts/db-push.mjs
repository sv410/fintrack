import "./load-env.mjs";
import { execSync } from "node:child_process";

execSync("pnpm --filter @workspace/db run push", { stdio: "inherit" });
