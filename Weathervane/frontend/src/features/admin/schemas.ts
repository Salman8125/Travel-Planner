import { z } from "zod";

import { CONDITIONS } from "@/lib/api/models";

const conditionEnum = z.enum(CONDITIONS as [string, ...string[]]);

function optionalNumber(bounds?: { min?: number; max?: number }) {
  return z
    .union([z.string(), z.number()])
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : Number(value)))
    .refine((value) => value === undefined || !Number.isNaN(value), { message: "Enter a number" })
    .refine((value) => value === undefined || bounds?.min === undefined || value >= bounds.min, {
      message: `Must be ≥ ${bounds?.min ?? 0}`,
    })
    .refine((value) => value === undefined || bounds?.max === undefined || value <= bounds.max, {
      message: `Must be ≤ ${bounds?.max ?? 0}`,
    });
}

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().min(1, "City is required"),
  country: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code")
    .transform((value) => value.toUpperCase()),
  latitude: z.coerce.number().min(-90, "Min -90").max(90, "Max 90"),
  longitude: z.coerce.number().min(-180, "Min -180").max(180, "Max 180"),
  timezone: z.string().min(1, "IANA timezone is required"),
});
export type LocationFormValues = z.infer<typeof locationSchema>;

export const forecastSchema = z.object({
  date: z.string().min(1, "Date is required"),
  high: z.coerce.number(),
  low: z.coerce.number(),
  condition: conditionEnum,
  precipitationChance: optionalNumber({ min: 0, max: 100 }),
  humidity: optionalNumber({ min: 0, max: 100 }),
  windKph: optionalNumber({ min: 0 }),
});
export type ForecastFormValues = z.infer<typeof forecastSchema>;

export const currentSchema = z.object({
  tempC: z.coerce.number(),
  condition: conditionEnum,
  humidity: optionalNumber({ min: 0, max: 100 }),
  windKph: optionalNumber({ min: 0 }),
});
export type CurrentFormValues = z.infer<typeof currentSchema>;
