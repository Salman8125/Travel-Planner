import { randomUUID } from "node:crypto";

import pino from "pino";
import { pinoHttp } from "pino-http";

import { config } from "../../../config/env.js";

export const logger = pino({ level: config.LOG_LEVEL });

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => (req as { requestId?: string }).requestId ?? randomUUID(),
  customProps: (req) => ({ requestId: (req as { requestId?: string }).requestId }),
});
