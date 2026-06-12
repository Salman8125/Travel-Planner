import type { components } from "./types";

type Schemas = components["schemas"];

type WithRequired<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };

export type Role = "USER" | "ADMIN";

export type Condition = NonNullable<Schemas["DailyForecast"]["condition"]>;

export const CONDITIONS: Condition[] = [
  "SUNNY",
  "PARTLY_CLOUDY",
  "CLOUDY",
  "RAINY",
  "SNOWY",
  "WINDY",
  "FOGGY",
  "STORMY",
];

export const CONDITION_LABELS: Record<Condition, string> = {
  SUNNY: "Sunny",
  PARTLY_CLOUDY: "Partly cloudy",
  CLOUDY: "Cloudy",
  RAINY: "Rainy",
  SNOWY: "Snowy",
  WINDY: "Windy",
  FOGGY: "Foggy",
  STORMY: "Stormy",
};

export type User = WithRequired<Schemas["User"], "id" | "email" | "role"> & { role: Role };

export type Location = WithRequired<
  Schemas["Location"],
  "id" | "name" | "city" | "country" | "latitude" | "longitude" | "timezone"
>;

export type DailyForecast = WithRequired<
  Schemas["DailyForecast"],
  "date" | "high" | "low" | "condition"
>;

export interface CurrentWeather {
  locationId: string;
  tempC: number;
  condition: Condition;
  humidity?: number | null;
  windKph?: number | null;
  observedAt: string;
}

export type Credentials = Schemas["Credentials"];
export type LocationInput = Schemas["LocationInput"];
export type DailyForecastInput = Schemas["DailyForecastInput"];
export type CurrentInput = Schemas["CurrentInput"];

export interface AuthResult {
  token: string;
  user: User;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Envelope<T> {
  data: T;
}

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Flatten {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}
