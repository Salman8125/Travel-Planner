import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { http, HttpResponse } from 'msw';

import type { CreateBookingRequest } from '@core/api/models';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { requestIdInterceptor } from '@core/interceptors/request-id.interceptor';

import { errorEnvelope } from '../../../testing/msw/handlers';
import { server } from '../../../testing/msw/server';
import { BookingsApi } from './bookings.api';

const body: CreateBookingRequest = {
  roomTypeId: 'rt-1',
  checkInDate: '2026-07-01',
  checkOutDate: '2026-07-03',
  numberOfRooms: 1,
  guests: [{ firstName: 'Ada', lastName: 'Lovelace' }],
  contactEmail: 'user@roost.dev',
};

describe('BookingsApi (MSW integration)', () => {
  let api: BookingsApi;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(
          withInterceptors([requestIdInterceptor, authInterceptor, errorInterceptor]),
        ),
      ],
    });
    api = TestBed.inject(BookingsApi);
  });

  it('sends the Idempotency-Key header on create', async () => {
    const seen: (string | null)[] = [];
    server.use(
      http.post('http://localhost:4002/api/bookings', ({ request }) => {
        seen.push(request.headers.get('Idempotency-Key'));
        return HttpResponse.json({ data: { reference: 'RST-1' } }, { status: 201 });
      }),
    );

    await api.create(body, 'idem-key-1');
    await api.create(body, 'idem-key-1');

    expect(seen).toEqual(['idem-key-1', 'idem-key-1']);
  });

  it('maps a 409 conflict to an ApiError exposing the unavailable nights', async () => {
    server.use(
      http.post('http://localhost:4002/api/bookings', () =>
        HttpResponse.json(
          errorEnvelope('insufficient_availability', 'Some nights are no longer available', {
            unavailableNights: ['2026-07-02'],
          }),
          { status: 409 },
        ),
      ),
    );

    await expect(api.create(body, 'idem-key-2')).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      code: 'insufficient_availability',
      details: { unavailableNights: ['2026-07-02'] },
    });
  });
});
