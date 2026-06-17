import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { http, HttpResponse } from 'msw';

import type { CreateHotelRequest } from '@core/api/models';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { requestIdInterceptor } from '@core/interceptors/request-id.interceptor';

import { server } from '../../../testing/msw/server';
import { testQueryClient } from '../../../testing/test-utils';
import { injectCreateHotel } from './admin.mutations';

const hotelBody: CreateHotelRequest = {
  name: 'New Hotel',
  city: 'London',
  country: 'GB',
  starRating: 4,
  latitude: 51.5,
  longitude: -0.12,
  timezone: 'Europe/London',
};

describe('admin mutations invalidate hotel queries', () => {
  it('invalidates the hotels query key after a hotel is created', async () => {
    const queryClient = testQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(
          withInterceptors([requestIdInterceptor, authInterceptor, errorInterceptor]),
        ),
        provideTanStackQuery(queryClient),
      ],
    });

    server.use(
      http.post('http://localhost:4002/api/hotels', () =>
        HttpResponse.json({ data: { id: 'h-new', name: 'New Hotel' } }, { status: 201 }),
      ),
    );

    const mutation = TestBed.runInInjectionContext(() => injectCreateHotel());
    await mutation.mutateAsync(hotelBody);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['hotels'] });
  });
});
