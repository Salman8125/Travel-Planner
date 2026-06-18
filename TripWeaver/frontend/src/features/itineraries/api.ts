import { api } from '@/lib/api/client';
import type {
  ItineraryDto,
  ItineraryListItemDto,
  UpdateItineraryRequest,
} from '@/lib/api/models';

export interface ListParams {
  status?: string;
  page?: number;
  pageSize?: number;
  scope?: string;
}

export const itinerariesApi = {
  list: (params: ListParams) =>
    api.list<ItineraryListItemDto>('/api/itineraries', {
      status: params.status,
      page: params.page,
      pageSize: params.pageSize,
    }),
  get: (reference: string) =>
    api.get<ItineraryDto>(`/api/itineraries/${encodeURIComponent(reference)}`),
  update: (reference: string, body: UpdateItineraryRequest, rowVersion: string) =>
    api.patch<ItineraryDto>(`/api/itineraries/${encodeURIComponent(reference)}`, body, {
      'If-Match': rowVersion,
    }),
  cancel: (reference: string) =>
    api.post<ItineraryDto>(`/api/itineraries/${encodeURIComponent(reference)}/cancel`, {}),
};
