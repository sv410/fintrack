import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuildBuild } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await esbuildBuild({
  entryPoints: [path.join(root, "artifacts/api-server/src/app.vercel.ts")],
  outfile: path.join(root, "api/index.js"),
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  logLevel: "info",
  sourcemap: false,
  external: ["pg-native"],
  footer: {
    js: "module.exports = module.exports.default ?? module.exports;",
  },
});

console.log("Built Vercel API → api/index.js");
