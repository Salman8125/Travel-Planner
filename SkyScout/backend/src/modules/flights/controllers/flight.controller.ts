import type { NextFunction, Request, Response } from "express";

import { ok } from "../../../shared/http/response.js";
import * as flightService from "../services/flight.service.js";
import type { CreateFlightInput, SearchFlightsInput, SetStatusInput, UpdateFlightInput } from "../types/flight.types.js";

export async function search(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await flightService.search(res.locals.body as SearchFlightsInput));
  } catch (err) {
    next(err);
  }
}

export async function getById(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    ok(res, await flightService.getById(id));
  } catch (err) {
    next(err);
  }
}

export async function create(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ok(res, await flightService.createFlight(res.locals.body as CreateFlightInput), 201);
  } catch (err) {
    next(err);
  }
}

export async function update(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    ok(res, await flightService.updateFlight(id, res.locals.body as UpdateFlightInput));
  } catch (err) {
    next(err);
  }
}

export async function setStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    const { status } = res.locals.body as SetStatusInput;
    ok(res, await flightService.setStatus(id, status));
  } catch (err) {
    next(err);
  }
}

export async function remove(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = res.locals.params as { id: string };
    await flightService.deleteFlight(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
