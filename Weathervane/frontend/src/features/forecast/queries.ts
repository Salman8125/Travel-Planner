import { useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { queryKeys, type ForecastParams } from "@/lib/api/query-keys";

import { getCurrentWeather, getForecast } from "./api";

function hasTarget(params: ForecastParams): boolean {
  return Boolean(params.locationId || params.city);
}

export function useForecast(params: MaybeRefOrGetter<ForecastParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.forecast.range(toValue(params))),
    queryFn: () => getForecast(toValue(params)),
    enabled: computed(() => hasTarget(toValue(params))),
  });
}

export function useCurrentWeather(params: MaybeRefOrGetter<ForecastParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.weather.current(toValue(params))),
    queryFn: () => getCurrentWeather(toValue(params)),
    enabled: computed(() => hasTarget(toValue(params))),
    meta: { suppressGlobalError: true },
  });
}
