import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { queryKeys } from '@/lib/api/query-keys';
import { notifySuccess } from '@/lib/notifier';
import { idempotency } from '@/lib/stores/trip-builder.store';
import type { BuildItineraryRequest, ItineraryDto } from '@/lib/api/models';
import { builderApi } from './api';

export function useBuildItinerary() {
  const queryClient = useQueryClient();
  return useMutation(() => ({
    mutationFn: (vars: { body: BuildItineraryRequest; key: string }) =>
      builderApi.build(vars.body, vars.key),
    meta: { suppressGlobalError: true },
    onSuccess: (dto: ItineraryDto) => {
      queryClient.setQueryData(queryKeys.itineraries.detail(dto.reference), dto);
      void queryClient.invalidateQueries({ queryKey: queryKeys.itineraries.all });
      idempotency.reset();
      notifySuccess('Itinerary created');
    },
  }));
}
