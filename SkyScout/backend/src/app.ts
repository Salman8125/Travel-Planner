import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { config } from "./config/env.js";
import { openapiDocument } from "./docs/openapi.js";
import { opsRoutes } from "./modules/ops/ops.routes.js";
import { apiRouter } from "./routes.js";
import { errorHandler } from "./shared/http/middleware/error.js";
import { httpLogger } from "./shared/http/middleware/logger.js";
import { globalLimiter } from "./shared/http/middleware/rateLimit.js";
import { requestId } from "./shared/http/middleware/requestId.js";

export function buildApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN.split(","),
      allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: config.BODY_LIMIT }));
  app.use(requestId);
  app.use(httpLogger);
  
  app.use(opsRoutes);
  app.get("/openapi.json", (_req, res) => res.json(openapiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

  app.use(globalLimiter);
  app.use("/api", apiRouter);

  app.use((req, res) => {
    res.status(404).json({ error: { code: "not_found", message: "Route not found", requestId: req.requestId } });
  });
  app.use(errorHandler);

  return app;
}
