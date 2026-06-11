import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const passengersSchema = z.object({
  adults: z.coerce.number().int().min(1, "At least one adult").max(9),
  children: z.coerce.number().int().min(0).max(9),
  infants: z.coerce.number().int().min(0).max(9),
});

export const searchFiltersSchema = z.object({
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  airlines: z.array(z.string()).optional(),
});

export const SORT_FIELDS = ["price", "departure", "duration"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const searchInputSchema = z.object({
  origin: z.string().trim().length(3).toUpperCase(),
  destination: z.string().trim().length(3).toUpperCase(),
  departureDate: dateOnly,
  returnDate: dateOnly.optional(),
  passengers: passengersSchema,
  cabin: z.enum(["ECONOMY", "BUSINESS", "FIRST"]).optional(),
  filters: searchFiltersSchema.optional(),
  sortBy: z.enum(SORT_FIELDS).optional(),
  order: z.enum(SORT_ORDERS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type SearchInput = z.infer<typeof searchInputSchema>;

export const searchFormSchema = z
  .object({
    origin: z.string().trim().length(3, "3-letter code").toUpperCase(),
    destination: z.string().trim().length(3, "3-letter code").toUpperCase(),
    departureDate: dateOnly,
    returnDate: z.string().optional(),
    adults: z.coerce.number().int().min(1, "Min 1").max(9),
    children: z.coerce.number().int().min(0).max(9),
    infants: z.coerce.number().int().min(0).max(9),
    cabin: z.enum(["ECONOMY", "BUSINESS", "FIRST", "ANY"]).default("ANY"),
  })
  .refine((d) => d.origin !== d.destination, {
    message: "Origin and destination must differ",
    path: ["destination"],
  })
  .refine((d) => !d.returnDate || d.returnDate >= d.departureDate, {
    message: "Return must be on or after departure",
    path: ["returnDate"],
  })
  .refine((d) => d.infants <= d.adults, {
    message: "Infants cannot exceed adults",
    path: ["infants"],
  });

export type SearchFormValues = z.input<typeof searchFormSchema>;
