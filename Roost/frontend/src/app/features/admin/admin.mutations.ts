import { inject } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';

import type {
  AvailabilityUpsertRequest,
  CreateHotelRequest,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest,
} from '@core/api/models';
import { notifySuccess } from '@core/api/notifier';
import { queryKeys } from '@core/api/query-keys';

import { AdminApi } from './admin.api';

function invalidateHotels(queryClient: ReturnType<typeof injectQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.hotels.all });
}

export function injectCreateHotel() {
  const api = inject(AdminApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (body: CreateHotelRequest) => api.createHotel(body),
    onSuccess: () => {
      invalidateHotels(queryClient);
      notifySuccess('Hotel created');
    },
    meta: { suppressGlobalError: true },
  }));
}

export function injectDeleteHotel() {
  const api = inject(AdminApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (id: string) => api.deleteHotel(id),
    onSuccess: () => {
      invalidateHotels(queryClient);
      notifySuccess('Hotel deleted');
    },
  }));
}

export function injectCreateRoomType() {
  const api = inject(AdminApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (vars: { hotelId: string; body: CreateRoomTypeRequest }) =>
      api.createRoomType(vars.hotelId, vars.body),
    onSuccess: () => {
      invalidateHotels(queryClient);
      notifySuccess('Room type added');
    },
    meta: { suppressGlobalError: true },
  }));
}

export function injectUpdateRoomType() {
  const api = inject(AdminApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (vars: { id: string; body: UpdateRoomTypeRequest }) =>
      api.updateRoomType(vars.id, vars.body),
    onSuccess: () => {
      invalidateHotels(queryClient);
      notifySuccess('Room type updated');
    },
    meta: { suppressGlobalError: true },
  }));
}

export function injectDeleteRoomType() {
  const api = inject(AdminApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (id: string) => api.deleteRoomType(id),
    onSuccess: () => {
      invalidateHotels(queryClient);
      notifySuccess('Room type deleted');
    },
  }));
}

export function injectUpsertAvailability() {
  const api = inject(AdminApi);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (vars: { roomTypeId: string; body: AvailabilityUpsertRequest }) =>
      api.upsertAvailability(vars.roomTypeId, vars.body),
    onSuccess: () => {
      invalidateHotels(queryClient);
      notifySuccess('Availability saved');
    },
    meta: { suppressGlobalError: true },
  }));
}
