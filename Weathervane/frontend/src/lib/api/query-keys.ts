export interface LocationListParams {
  q?: string;
  country?: string;
  page?: number;
  pageSize?: number;
}

export interface ForecastParams {
  locationId?: string;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
}

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  locations: {
    all: ["locations"] as const,
    list: (params: LocationListParams) => ["locations", "list", params] as const,
    detail: (id: string) => ["locations", "detail", id] as const,
  },
  forecast: {
    all: ["forecast"] as const,
    range: (params: ForecastParams) => ["forecast", "range", params] as const,
  },
  weather: {
    all: ["weather"] as const,
    current: (params: ForecastParams) => ["weather", "current", params] as const,
  },
} as const;
