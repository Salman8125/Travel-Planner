import { inject } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';

import type { BookingDto, CreateBookingRequest } from '@core/api/models';
import { notifySuccess } from '@core/api/notifier';
import { queryKeys } from '@core/api/query-keys';

import { BookingsApi } from './bookings.api';

export function injectCreateBooking() {
  const api = inject(BookingsApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (vars: { body: CreateBookingRequest; key: string }) => api.create(vars.body, vars.key),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
    },
    meta: { suppressGlobalError: true },
  }));
}

interface CancelContext {
  previous?: BookingDto;
  reference: string;
}

export function injectCancelBooking() {
  const api = inject(BookingsApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (reference: string) => api.cancel(reference),
    onMutate: async (reference: string): Promise<CancelContext> => {
      const key = queryKeys.bookings.detail(reference);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BookingDto>(key);
      if (previous) {
        queryClient.setQueryData<BookingDto>(key, { ...previous, status: 'CANCELLED' });
      }
      return { previous, reference };
    },
    onError: (_error, _reference, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.bookings.detail(context.reference), context.previous);
      }
    },
    onSuccess: () => notifySuccess('Booking cancelled'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  }));
}
