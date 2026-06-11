import { z } from "zod";

export const cabinRowSchema = z.object({
  cabin: z.enum(["ECONOMY", "BUSINESS", "FIRST"]),
  totalSeats: z.coerce.number().int().positive("Must be > 0"),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "e.g. 199.00"),
  currency: z.string().trim().length(3, "3-letter code").toUpperCase(),
});

export const createFlightSchema = z
  .object({
    flightNumber: z.string().trim().min(2, "Required").max(16),
    airlineIata: z.string().trim().length(2, "2-letter code").toUpperCase(),
    origin: z.string().trim().length(3, "3-letter code").toUpperCase(),
    destination: z.string().trim().length(3, "3-letter code").toUpperCase(),
    scheduledDeparture: z.string().min(1, "Required"),
    scheduledArrival: z.string().min(1, "Required"),
    cabins: z.array(cabinRowSchema).min(1, "At least one cabin"),
  })
  .refine((d) => d.origin !== d.destination, {
    message: "Origin and destination must differ",
    path: ["destination"],
  })
  .refine((d) => new Date(d.scheduledArrival) > new Date(d.scheduledDeparture), {
    message: "Arrival must be after departure",
    path: ["scheduledArrival"],
  });

export type CreateFlightFormValues = z.infer<typeof createFlightSchema>;

export const airportSchema = z.object({
  iataCode: z.string().trim().length(3, "3-letter code").toUpperCase(),
  name: z.string().trim().min(1, "Required"),
  city: z.string().trim().min(1, "Required"),
  country: z.string().trim().length(2, "2-letter code").toUpperCase(),
  timezone: z.string().trim().min(1, "Required"),
});

export const airlineSchema = z.object({
  iataCode: z.string().trim().length(2, "2-letter code").toUpperCase(),
  name: z.string().trim().min(1, "Required"),
});

export type AirportFormValues = z.infer<typeof airportSchema>;
export type AirlineFormValues = z.infer<typeof airlineSchema>;
