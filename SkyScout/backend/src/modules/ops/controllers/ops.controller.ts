import type { Request, Response } from "express";

import { sql } from "../../../infra/db/client.js";

export function health(_req: Request, res: Response): void {
  res.json({ status: "ok" });
}

export async function ready(_req: Request, res: Response): Promise<void> {
  try {
    await sql`select 1`;
    res.json({ status: "ready", db: "up" });
  } catch {
    res.status(503).json({ status: "unavailable", db: "down" });
  }
}
