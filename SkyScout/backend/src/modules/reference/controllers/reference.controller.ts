import type { NextFunction, Request, Response } from "express";

import { ok } from "../../../shared/http/response.js";
import * as referenceService from "../services/reference.service.js";
import type {
  CreateAirlineInput,
  CreateAirportInput,
  UpdateAirlineInput,
  UpdateAirportInput,
} from "../types/reference.types.js";

export async function listAirports(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, pageSize } = res.locals.query as { page: number; pageSize: number };
    const { data, meta } = await referenceService.listAirports(page, pageSize);
    ok(res, data, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getAirport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    ok(res, await referenceService.getAirport(id));
  } catch (err) {
    next(err);
  }
}

export async function createAirport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await referenceService.createAirport(res.locals.body as CreateAirportInput), 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAirport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    ok(res, await referenceService.updateAirport(id, res.locals.body as UpdateAirportInput));
  } catch (err) {
    next(err);
  }
}

export async function deleteAirport(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    await referenceService.deleteAirport(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function listAirlines(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, pageSize } = res.locals.query as { page: number; pageSize: number };
    const { data, meta } = await referenceService.listAirlines(page, pageSize);
    ok(res, data, 200, meta);
  } catch (err) {
    next(err);
  }
}

export async function getAirline(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    ok(res, await referenceService.getAirline(id));
  } catch (err) {
    next(err);
  }
}

export async function createAirline(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await referenceService.createAirline(res.locals.body as CreateAirlineInput), 201);
  } catch (err) {
    next(err);
  }
}

export async function updateAirline(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    ok(res, await referenceService.updateAirline(id, res.locals.body as UpdateAirlineInput));
  } catch (err) {
    next(err);
  }
}

export async function deleteAirline(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    await referenceService.deleteAirline(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
