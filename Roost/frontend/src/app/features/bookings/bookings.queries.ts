import { Signal, inject } from '@angular/core';
import { injectQuery, keepPreviousData } from '@tanstack/angular-query-experimental';

import { queryKeys } from '@core/api/query-keys';

import { BookingsApi } from './bookings.api';

const PAGE_SIZE = 20;

export function injectBooking(reference: Signal<string>) {
  const api = inject(BookingsApi);
  return injectQuery(() => ({
    queryKey: queryKeys.bookings.detail(reference()),
    queryFn: () => api.get(reference()),
    enabled: !!reference(),
  }));
}

export function injectMyBookings(page: Signal<number>) {
  const api = inject(BookingsApi);
  return injectQuery(() => ({
    queryKey: queryKeys.bookings.list({ page: page() }),
    queryFn: () => api.list(page(), PAGE_SIZE),
    placeholderData: keepPreviousData,
  }));
}
