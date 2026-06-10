import { z } from "zod";

import { CABINS, PASSENGER_TYPES } from "../../../shared/enums.js";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const createBookingSchema = z.object({
  flightId: z.string().uuid(),
  cabin: z.enum(CABINS),
  contactEmail: z.string().email(),
  passengers: z
    .array(
      z.object({
        firstName: z.string().trim().min(1),
        lastName: z.string().trim().min(1),
        dateOfBirth: dateOnly,
        type: z.enum(PASSENGER_TYPES),
        passportNumber: z.string().trim().min(1).optional(),
      }),
    )
    .min(1),
});

export const referenceParamSchema = z.object({ reference: z.string().trim().length(6) });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
