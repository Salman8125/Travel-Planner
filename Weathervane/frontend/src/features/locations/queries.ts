import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

import { queryKeys, type LocationListParams } from "@/lib/api/query-keys";

import { getLocation, listLocations } from "./api";

export function useLocationsList(params: MaybeRefOrGetter<LocationListParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.locations.list(toValue(params))),
    queryFn: () => listLocations(toValue(params)),
    placeholderData: keepPreviousData,
  });
}

export function useLocation(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.locations.detail(toValue(id))),
    queryFn: () => getLocation(toValue(id)),
    enabled: computed(() => Boolean(toValue(id))),
  });
}
