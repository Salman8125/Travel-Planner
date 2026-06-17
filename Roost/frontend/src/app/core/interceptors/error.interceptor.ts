import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { ApiError } from '@core/error/api-error';

import { AuthStore } from '../auth/auth.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = ApiError.fromHttp(error);
      if (apiError.status === 401 && !req.url.includes('/api/auth/')) {
        const wasAuthenticated = auth.isAuthenticated();
        auth.clearSession();
        if (wasAuthenticated) {
          void router.navigate(['/login'], { queryParams: { returnTo: router.url } });
        }
      }
      return throwError(() => apiError);
    }),
  );
};
