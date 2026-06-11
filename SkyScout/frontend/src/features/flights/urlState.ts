import { searchInputSchema, type SearchInput } from "./schemas";

export function parseSearchParams(params: URLSearchParams): SearchInput | null {
  const origin = params.get("origin");
  const destination = params.get("destination");
  const departureDate = params.get("departureDate");
  if (!origin || !destination || !departureDate) return null;

  const airlines = params.get("airlines");
  const priceMin = params.get("priceMin") ?? undefined;
  const priceMax = params.get("priceMax") ?? undefined;
  const hasFilters = airlines || priceMin || priceMax;

  const candidate = {
    origin,
    destination,
    departureDate,
    returnDate: params.get("returnDate") ?? undefined,
    passengers: {
      adults: params.get("adults") ?? 1,
      children: params.get("children") ?? 0,
      infants: params.get("infants") ?? 0,
    },
    cabin: params.get("cabin") ?? undefined,
    filters: hasFilters
      ? {
          priceMin,
          priceMax,
          airlines: airlines ? airlines.split(",").filter(Boolean) : undefined,
        }
      : undefined,
    sortBy: params.get("sortBy") ?? undefined,
    order: params.get("order") ?? undefined,
    page: params.get("page") ?? 1,
    pageSize: params.get("pageSize") ?? 10,
  };

  const result = searchInputSchema.safeParse(candidate);
  return result.success ? result.data : null;
}

export function searchInputToParams(input: SearchInput): Record<string, string> {
  const out: Record<string, string> = {
    origin: input.origin,
    destination: input.destination,
    departureDate: input.departureDate,
    adults: String(input.passengers.adults),
    children: String(input.passengers.children),
    infants: String(input.passengers.infants),
    page: String(input.page),
    pageSize: String(input.pageSize),
  };
  if (input.returnDate) out.returnDate = input.returnDate;
  if (input.cabin) out.cabin = input.cabin;
  if (input.sortBy) out.sortBy = input.sortBy;
  if (input.order) out.order = input.order;
  if (input.filters?.priceMin) out.priceMin = input.filters.priceMin;
  if (input.filters?.priceMax) out.priceMax = input.filters.priceMax;
  if (input.filters?.airlines?.length) out.airlines = input.filters.airlines.join(",");
  return out;
}
