import { http, unwrap } from "@/lib/api/client";
import type {
  CurrentInput,
  CurrentWeather,
  DailyForecast,
  DailyForecastInput,
  Location,
  LocationInput,
} from "@/lib/api/models";

export function createLocation(body: LocationInput): Promise<Location> {
  return unwrap<Location>(http.post("/api/locations", body));
}

export function updateLocation(id: string, body: Partial<LocationInput>): Promise<Location> {
  return unwrap<Location>(http.patch(`/api/locations/${encodeURIComponent(id)}`, body));
}

export async function deleteLocation(id: string): Promise<void> {
  await http.delete(`/api/locations/${encodeURIComponent(id)}`);
}

export function upsertForecast(id: string, body: DailyForecastInput): Promise<DailyForecast> {
  return unwrap<DailyForecast>(http.put(`/api/locations/${encodeURIComponent(id)}/forecast`, body));
}

export function setCurrentWeather(id: string, body: CurrentInput): Promise<CurrentWeather> {
  return unwrap<CurrentWeather>(http.put(`/api/locations/${encodeURIComponent(id)}/current`, body));
}
