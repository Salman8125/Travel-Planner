import { http, unwrap } from "@/lib/api/client";
import type { CurrentWeather, DailyForecast } from "@/lib/api/models";
import type { ForecastParams } from "@/lib/api/query-keys";

export function getForecast(params: ForecastParams): Promise<DailyForecast[]> {
  return unwrap<DailyForecast[]>(http.get("/api/forecast", { params }));
}

export function getCurrentWeather(params: ForecastParams): Promise<CurrentWeather> {
  return unwrap<CurrentWeather>(http.get("/api/weather/current", { params }));
}
