import { Injectable, inject } from '@angular/core';

import { HttpApi } from '@core/api/http';
import type { BookingDto, CreateBookingRequest, PageMeta } from '@core/api/models';

@Injectable({ providedIn: 'root' })
export class BookingsApi {
  private readonly api = inject(HttpApi);

  create(body: CreateBookingRequest, idempotencyKey: string): Promise<BookingDto> {
    return this.api.post<BookingDto>('/api/bookings', body, { 'Idempotency-Key': idempotencyKey });
  }

  get(reference: string): Promise<BookingDto> {
    return this.api.getOne<BookingDto>(`/api/bookings/${encodeURIComponent(reference)}`);
  }

  list(page: number, pageSize: number): Promise<{ data: BookingDto[]; meta: PageMeta }> {
    return this.api.getList<BookingDto>('/api/bookings', { page, pageSize });
  }

  cancel(reference: string): Promise<BookingDto> {
    return this.api.post<BookingDto>(`/api/bookings/${encodeURIComponent(reference)}/cancel`, {});
  }
}
