import type { Response } from "express";

export function ok<T>(res: Response, data: T, status = 200, meta?: unknown): void {
  if (meta === undefined) {
    res.status(status).json({ data });
  } else {
    res.status(status).json({ data, meta });
  }
}
