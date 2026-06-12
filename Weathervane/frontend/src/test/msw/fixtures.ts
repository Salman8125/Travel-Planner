import type {
  CurrentWeather,
  DailyForecast,
  Location,
  User,
} from "@/lib/api/models";

export const adminUser: User = {
  id: "00000000-0000-0000-0000-0000000000a1",
  email: "admin@weathervane.dev",
  role: "ADMIN",
};

export const standardUser: User = {
  id: "00000000-0000-0000-0000-0000000000u1",
  email: "user@weathervane.dev",
  role: "USER",
};

export const ADMIN_TOKEN = "test-admin-token";
export const USER_TOKEN = "test-user-token";

export const istanbul: Location = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Istanbul",
  city: "Istanbul",
  country: "TR",
  latitude: 41.0082,
  longitude: 28.9784,
  timezone: "Europe/Istanbul",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

export const tokyo: Location = {
  id: "22222222-2222-2222-2222-222222222222",
  name: "Tokyo",
  city: "Tokyo",
  country: "JP",
  latitude: 35.6762,
  longitude: 139.6503,
  timezone: "Asia/Tokyo",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

export const locations: Location[] = [istanbul, tokyo];

export const istanbulForecast: DailyForecast[] = [
  { date: "2026-06-12", high: 28, low: 19, condition: "SUNNY", precipitationChance: 5, humidity: 45, windKph: 10 },
  { date: "2026-06-13", high: 27, low: 18, condition: "PARTLY_CLOUDY", precipitationChance: 20, humidity: 55, windKph: 12 },
  { date: "2026-06-14", high: 24, low: 17, condition: "RAINY", precipitationChance: 80, humidity: 70, windKph: 18 },
];

export const istanbulCurrent: CurrentWeather = {
  locationId: istanbul.id,
  tempC: 26,
  condition: "SUNNY",
  humidity: 48,
  windKph: 11,
  observedAt: "2026-06-12T12:00:00Z",
};
