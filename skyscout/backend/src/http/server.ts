// HTTP layer — thin Express server. Parses the body, calls a domain function, returns JSON.
// One POST endpoint per skill. Permissive CORS (dev only) so browser frontends on localhost
// can call cross-origin.

import express, { Request, Response } from "express";
import cors from "cors";
import { searchFlights, getFlightDetails } from "../domain/flight";

export function createServer() {
  const app = express();
  app.use(cors()); // dev-only: allow any origin; handles the OPTIONS preflight
  app.use(express.json());

  // skill: search_flights -> FlightOption[]
  app.post("/search_flights", (req: Request, res: Response) => {
    const { origin, destination } = req.body ?? {};
    res.json(searchFlights({ origin, destination }));
  });

  // skill: get_flight_details -> FlightOption[] (0 or 1 element)
  app.post("/get_flight_details", (req: Request, res: Response) => {
    const { flightId } = req.body ?? {};
    res.json(getFlightDetails(String(flightId ?? "")));
  });

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  return app;
}
