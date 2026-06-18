import { useMutation, useQueryClient } from '@tanstack/solid-query';
import { queryKeys } from '@/lib/api/query-keys';
import { isApiError } from '@/lib/api/error';
import { notifyError, notifySuccess } from '@/lib/notifier';
import type { ItineraryDto, UpdateItineraryRequest } from '@/lib/api/models';
import { itinerariesApi } from './api';

interface CancelContext {
  previous?: ItineraryDto;
  reference: string;
}

export function useCancelItinerary() {
  const queryClient = useQueryClient();
  return useMutation(() => ({
    mutationFn: (reference: string) => itinerariesApi.cancel(reference),
    onMutate: async (reference): Promise<CancelContext> => {
      const key = queryKeys.itineraries.detail(reference);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ItineraryDto>(key);
      if (previous) {
        queryClient.setQueryData<ItineraryDto>(key, { ...previous, status: 'CANCELLED' });
      }
      return { previous, reference };
    },
    onError: (_error, _reference, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.itineraries.detail(context.reference), context.previous);
      }
    },
    onSuccess: () => notifySuccess('Itinerary cancelled'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.itineraries.all }),
  }));
}

export function useUpdateItinerary() {
  const queryClient = useQueryClient();
  return useMutation(() => ({
    mutationFn: (vars: { reference: string; body: UpdateItineraryRequest; rowVersion: string }) =>
      itinerariesApi.update(vars.reference, vars.body, vars.rowVersion),
    meta: { suppressGlobalError: true },
    onSuccess: (dto, vars) => {
      queryClient.setQueryData(queryKeys.itineraries.detail(vars.reference), dto);
      void queryClient.invalidateQueries({ queryKey: queryKeys.itineraries.all });
      notifySuccess('Itinerary updated');
    },
    onError: (error, vars) => {
      if (isApiError(error) && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.itineraries.detail(vars.reference) });
        notifyError('This itinerary changed since you opened it. Review the latest version and retry.');
      } else if (isApiError(error)) {
        notifyError(error.message);
      }
    },
  }));
}
