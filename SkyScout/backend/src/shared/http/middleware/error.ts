import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../errors.js";
import { logger } from "./logger.js";

const PG_MAP: Record<string, { status: number; code: string }> = {
  "23505": { status: 409, code: "conflict" },
  "23503": { status: 409, code: "foreign_key_violation" },
  "23514": { status: 400, code: "constraint_violation" },
  "22P02": { status: 400, code: "invalid_input" },
  "22007": { status: 400, code: "invalid_datetime" },
  "22008": { status: 400, code: "invalid_datetime" },
};

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    res.status(err.httpStatus).json({
      error: { code: err.code, message: err.message, details: err.details, requestId },
    });
    return;
  }

  const pgCode = (err as { code?: string })?.code;
  if (pgCode && PG_MAP[pgCode]) {
    const mapped = PG_MAP[pgCode];
    res.status(mapped.status).json({
      error: { code: mapped.code, message: "Database constraint violation", requestId },
    });
    return;
  }

  logger.error({ err, requestId }, "unhandled error");
  res.status(500).json({ error: { code: "internal_error", message: "Internal server error", requestId } });
}
