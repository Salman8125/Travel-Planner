import { z } from "zod";

import { CABINS, FLIGHT_STATUS } from "../../../shared/enums.js";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const searchSchema = z.object({
  origin: z.string().trim().length(3),
  destination: z.string().trim().length(3),
  departureDate: dateOnly,
  returnDate: dateOnly.optional(),
  passengers: z
    .object({
      adults: z.number().int().min(0),
      children: z.number().int().min(0),
      infants: z.number().int().min(0),
    })
    .default({ adults: 1, children: 0, infants: 0 }),
  cabin: z.enum(CABINS).optional(),
  filters: z
    .object({
      priceMin: z.string().optional(),
      priceMax: z.string().optional(),
      maxStops: z.number().int().optional(),
      airlines: z.array(z.string()).optional(),
      departureWindow: z.object({ from: z.string().optional(), to: z.string().optional() }).optional(),
    })
    .optional(),
  sortBy: z.enum(["price", "departure", "duration"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({ id: z.string().uuid() });

const cabinInputSchema = z.object({
  cabin: z.enum(CABINS),
  totalSeats: z.number().int().positive(),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "expected a decimal string"),
  currency: z.string().trim().length(3).toUpperCase(),
});

export const createFlightSchema = z
  .object({
    flightNumber: z.string().trim().min(2).max(16),
    airlineIata: z.string().trim().length(2).toUpperCase(),
    origin: z.string().trim().length(3).toUpperCase(),
    destination: z.string().trim().length(3).toUpperCase(),
    scheduledDeparture: z.string().datetime(),
    scheduledArrival: z.string().datetime(),
    aircraftId: z.string().uuid().optional(),
    cabins: z.array(cabinInputSchema).min(1),
  })
  .refine((d) => d.origin !== d.destination, { message: "origin and destination must differ", path: ["destination"] })
  .refine((d) => new Date(d.scheduledArrival) > new Date(d.scheduledDeparture), {
    message: "scheduledArrival must be after scheduledDeparture",
    path: ["scheduledArrival"],
  });

export const updateFlightSchema = z
  .object({
    flightNumber: z.string().trim().min(2).max(16).optional(),
    scheduledDeparture: z.string().datetime().optional(),
    scheduledArrival: z.string().datetime().optional(),
    aircraftId: z.string().uuid().nullable().optional(),
    status: z.enum(FLIGHT_STATUS).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "at least one field is required" })
  .refine((o) => o.status !== "CANCELLED", {
    message: "use PATCH /:id/status to cancel a flight (it cascades to bookings)",
    path: ["status"],
  });

export const setStatusSchema = z.object({ status: z.enum(FLIGHT_STATUS) });
