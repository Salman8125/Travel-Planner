import { keepPreviousData, useQuery } from '@tanstack/solid-query';
import { queryKeys } from '@/lib/api/query-keys';
import { itinerariesApi, type ListParams } from './api';

export function useItineraries(params: () => ListParams) {
  return useQuery(() => ({
    queryKey: queryKeys.itineraries.list(params()),
    queryFn: () => itinerariesApi.list(params()),
    placeholderData: keepPreviousData,
  }));
}

export function useItinerary(reference: () => string) {
  return useQuery(() => ({
    queryKey: queryKeys.itineraries.detail(reference()),
    queryFn: () => itinerariesApi.get(reference()),
    enabled: !!reference(),
  }));
}
