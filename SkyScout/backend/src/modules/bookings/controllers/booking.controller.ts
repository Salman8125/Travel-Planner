import type { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../../../shared/errors.js";
import { ok } from "../../../shared/http/response.js";
import * as bookingService from "../services/booking.service.js";
import type { CreateBookingInput } from "../types/booking.types.js";

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const input = res.locals.body as CreateBookingInput;
    const header = req.headers["idempotency-key"];
    const idempotencyKey = typeof header === "string" && header.trim() ? header.trim() : undefined;
    const { booking, replayed } = await bookingService.createBooking(input, { userId: req.user.id, idempotencyKey });
    ok(res, booking, replayed ? 200 : 201);
  } catch (err) {
    next(err);
  }
}

export async function getByReference(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const { reference } = res.locals.params as { reference: string };
    ok(res, await bookingService.getByReference(reference, { userId: req.user.id, role: req.user.role }));
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const { reference } = res.locals.params as { reference: string };
    const { booking } = await bookingService.cancel(reference, { userId: req.user.id, role: req.user.role });
    ok(res, booking, 200);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const { page, pageSize } = res.locals.query as { page: number; pageSize: number };
    const { data, meta } = await bookingService.list({ userId: req.user.id, role: req.user.role }, page, pageSize);
    ok(res, data, 200, meta);
  } catch (err) {
    next(err);
  }
}
