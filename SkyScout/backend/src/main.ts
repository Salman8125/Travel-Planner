import { buildApp } from "./app.js";
import { config } from "./config/env.js";
import { sql } from "./infra/db/client.js";
import { logger } from "./shared/http/middleware/logger.js";

const app = buildApp();

const server = app.listen(config.PORT, "0.0.0.0", () => {
  logger.info(`SkyScout backend listening on http://0.0.0.0:${config.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    try {
      await sql.end({ timeout: 5 });
    } catch (err) {
      logger.error({ err }, "error closing database");
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error({ reason }, "unhandledRejection"));
process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaughtException");
  process.exit(1);
});
