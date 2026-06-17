import { Injectable, inject } from '@angular/core';

import { HttpApi } from '@core/api/http';
import type {
  AvailabilityNightDto,
  AvailabilityUpsertRequest,
  CreateHotelRequest,
  CreateRoomTypeRequest,
  HotelDto,
  RoomTypeDto,
  UpdateHotelRequest,
  UpdateRoomTypeRequest,
} from '@core/api/models';

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly api = inject(HttpApi);

  createHotel(body: CreateHotelRequest): Promise<HotelDto> {
    return this.api.post<HotelDto>('/api/hotels', body);
  }

  updateHotel(id: string, body: UpdateHotelRequest): Promise<HotelDto> {
    return this.api.patch<HotelDto>(`/api/hotels/${encodeURIComponent(id)}`, body);
  }

  deleteHotel(id: string): Promise<void> {
    return this.api.delete(`/api/hotels/${encodeURIComponent(id)}`);
  }

  createRoomType(hotelId: string, body: CreateRoomTypeRequest): Promise<RoomTypeDto> {
    return this.api.post<RoomTypeDto>(`/api/hotels/${encodeURIComponent(hotelId)}/room-types`, body);
  }

  updateRoomType(id: string, body: UpdateRoomTypeRequest): Promise<RoomTypeDto> {
    return this.api.patch<RoomTypeDto>(`/api/room-types/${encodeURIComponent(id)}`, body);
  }

  deleteRoomType(id: string): Promise<void> {
    return this.api.delete(`/api/room-types/${encodeURIComponent(id)}`);
  }

  upsertAvailability(
    roomTypeId: string,
    body: AvailabilityUpsertRequest,
  ): Promise<AvailabilityNightDto[]> {
    return this.api.put<AvailabilityNightDto[]>(
      `/api/room-types/${encodeURIComponent(roomTypeId)}/availability`,
      body,
    );
  }
}
