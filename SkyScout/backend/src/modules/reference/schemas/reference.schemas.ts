import { z } from "zod";

const iata3 = z.string().trim().length(3).toUpperCase();
const iata2 = z.string().trim().length(2).toUpperCase();
const country2 = z.string().trim().length(2).toUpperCase();
const nonEmpty = z.string().trim().min(1);

export const createAirportSchema = z.object({
  iataCode: iata3,
  name: nonEmpty,
  city: nonEmpty,
  country: country2,
  timezone: nonEmpty,
});

export const updateAirportSchema = createAirportSchema.partial().refine(
  (o) => Object.keys(o).length > 0,
  { message: "at least one field is required" },
);

export const createAirlineSchema = z.object({
  iataCode: iata2,
  name: nonEmpty,
});

export const updateAirlineSchema = createAirlineSchema.partial().refine(
  (o) => Object.keys(o).length > 0,
  { message: "at least one field is required" },
);

export const idParamSchema = z.object({ id: z.string().uuid() });

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
