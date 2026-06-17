import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { http, HttpResponse } from 'msw';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { requestIdInterceptor } from '@core/interceptors/request-id.interceptor';

import { errorEnvelope } from '../../../testing/msw/handlers';
import { server } from '../../../testing/msw/server';
import { HotelsApi } from './hotels.api';

describe('HotelsApi (MSW integration)', () => {
  let api: HotelsApi;

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
    api = TestBed.inject(HotelsApi);
  });

  it('unwraps the list envelope (data + meta) for search', async () => {
    const res = await api.search({
      city: 'London',
      checkInDate: '2026-07-01',
      checkOutDate: '2026-07-03',
      guests: 2,
    });
    expect(res.data).toHaveLength(1);
    expect(res.data[0].name).toBe('The Thames View');
    expect(res.meta.total).toBe(1);
  });

  it('unwraps the single envelope for detail', async () => {
    const detail = await api.detail('h-1');
    expect(detail.hotel.name).toBe('The Thames View');
    expect(detail.roomTypes[0].name).toBe('Deluxe King');
  });

  it('surfaces backend errors as ApiError via the interceptor', async () => {
    server.use(
      http.post('http://localhost:4002/api/hotels/search', () =>
        HttpResponse.json(errorEnvelope('validation_error', 'Bad city'), { status: 400 }),
      ),
    );
    await expect(
      api.search({ city: '', checkInDate: '2026-07-01', checkOutDate: '2026-07-03', guests: 2 }),
    ).rejects.toMatchObject({ name: 'ApiError', status: 400, code: 'validation_error' });
  });
});
