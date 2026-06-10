import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

import { ValidationError } from "../../errors.js";

type Source = "body" | "query" | "params";

export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ValidationError("Request validation failed", result.error.flatten()));
    }
    res.locals[source] = result.data;
    next();
  };
}
