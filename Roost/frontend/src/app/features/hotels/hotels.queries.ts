import { Signal, inject } from '@angular/core';
import { injectQuery, keepPreviousData } from '@tanstack/angular-query-experimental';

import type { HotelSearchRequest } from '@core/api/models';
import { queryKeys } from '@core/api/query-keys';

import { HotelsApi } from './hotels.api';

export interface DetailDates {
  checkInDate?: string;
  checkOutDate?: string;
}

export function injectHotelSearch(criteria: Signal<HotelSearchRequest | null>) {
  const api = inject(HotelsApi);
  return injectQuery(() => {
    const c = criteria();
    return {
      queryKey: queryKeys.hotels.search(c),
      queryFn: () => api.search(c as HotelSearchRequest),
      enabled: c !== null,
      placeholderData: keepPreviousData,
    };
  });
}

export function injectHotelDetail(id: Signal<string>, dates: Signal<DetailDates>) {
  const api = inject(HotelsApi);
  return injectQuery(() => {
    const d = dates();
    return {
      queryKey: queryKeys.hotels.detail(id(), d),
      queryFn: () => api.detail(id(), d.checkInDate, d.checkOutDate),
      enabled: !!id(),
    };
  });
}

export function injectHotelRooms(
  id: Signal<string>,
  dates: Signal<Required<DetailDates>>,
  guests: Signal<number | undefined>,
) {
  const api = inject(HotelsApi);
  return injectQuery(() => {
    const d = dates();
    return {
      queryKey: queryKeys.hotels.rooms(id(), { ...d, guests: guests() }),
      queryFn: () => api.rooms(id(), d.checkInDate, d.checkOutDate, guests()),
      enabled: !!id() && !!d.checkInDate && !!d.checkOutDate,
    };
  });
}
