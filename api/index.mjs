import { createServer } from "@vercel/node";
import app from "../artifacts/api-server/dist/app.mjs";

export default createServer(app);
