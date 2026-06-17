import { Injectable, inject } from '@angular/core';

import { HttpApi } from '@core/api/http';
import type {
  HotelDetailDto,
  HotelSearchItem,
  HotelSearchRequest,
  PageMeta,
  RoomTypeOffer,
} from '@core/api/models';

@Injectable({ providedIn: 'root' })
export class HotelsApi {
  private readonly api = inject(HttpApi);

  search(body: HotelSearchRequest): Promise<{ data: HotelSearchItem[]; meta: PageMeta }> {
    return this.api.postList<HotelSearchItem>('/api/hotels/search', body);
  }

  detail(id: string, checkInDate?: string, checkOutDate?: string): Promise<HotelDetailDto> {
    return this.api.getOne<HotelDetailDto>(`/api/hotels/${encodeURIComponent(id)}`, {
      checkInDate,
      checkOutDate,
    });
  }

  rooms(
    id: string,
    checkInDate: string,
    checkOutDate: string,
    guests?: number,
  ): Promise<RoomTypeOffer[]> {
    return this.api.getOne<RoomTypeOffer[]>(`/api/hotels/${encodeURIComponent(id)}/rooms`, {
      checkInDate,
      checkOutDate,
      guests,
    });
  }
}
