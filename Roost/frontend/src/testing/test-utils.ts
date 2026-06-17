import { EnvironmentProviders, Provider, Type } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { QueryClient, provideTanStackQuery } from '@tanstack/angular-query-experimental';
import { RenderComponentOptions, RenderResult, render } from '@testing-library/angular';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { requestIdInterceptor } from '@core/interceptors/request-id.interceptor';

export function testQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function commonProviders(): (Provider | EnvironmentProviders)[] {
  return [
    provideNoopAnimations(),
    provideNativeDateAdapter(),
    provideRouter([]),
    provideHttpClient(withInterceptors([requestIdInterceptor, authInterceptor, errorInterceptor])),
    provideTanStackQuery(testQueryClient()),
  ];
}

export function renderWithProviders<T>(
  component: Type<T>,
  options: RenderComponentOptions<T> = {},
): Promise<RenderResult<T>> {
  return render(component, {
    ...options,
    providers: [...commonProviders(), ...(options.providers ?? [])],
  });
}
