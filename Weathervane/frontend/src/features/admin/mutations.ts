import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import type {
  CurrentInput,
  DailyForecastInput,
  Location,
  LocationInput,
} from "@/lib/api/models";
import { queryKeys } from "@/lib/api/query-keys";

import {
  createLocation,
  deleteLocation,
  setCurrentWeather,
  updateLocation,
  upsertForecast,
} from "./api";

function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.locations.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.forecast.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.weather.all });
  };
}

export function useCreateLocation() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (body: LocationInput) => createLocation(body),
    onSuccess: () => {
      invalidate();
      toast.success("Location created");
    },
    meta: { suppressGlobalError: true },
  });
}

export function useUpdateLocation() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (vars: { id: string; body: Partial<LocationInput> }) =>
      updateLocation(vars.id, vars.body),
    onSuccess: () => {
      invalidate();
      toast.success("Location updated");
    },
    meta: { suppressGlobalError: true },
  });
}

export function useDeleteLocation() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (location: Location) => deleteLocation(location.id),
    onSuccess: (_data, location) => {
      invalidate();
      toast.success(`Deleted ${location.name}`);
    },
  });
}

export function useUpsertForecast() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (vars: { id: string; body: DailyForecastInput }) =>
      upsertForecast(vars.id, vars.body),
    onSuccess: () => {
      invalidate();
      toast.success("Forecast saved");
    },
    meta: { suppressGlobalError: true },
  });
}

export function useSetCurrentWeather() {
  const invalidate = useInvalidateAll();
  return useMutation({
    mutationFn: (vars: { id: string; body: CurrentInput }) => setCurrentWeather(vars.id, vars.body),
    onSuccess: () => {
      invalidate();
      toast.success("Current weather saved");
    },
    meta: { suppressGlobalError: true },
  });
}
