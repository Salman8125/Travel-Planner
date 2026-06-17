import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { config } from '@core/config/app-config';

import { AuthStore } from '../auth/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const token = auth.token();
  if (token && req.url.startsWith(config.apiUrl)) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
