import { HttpInterceptorFn } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

export const requestIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('X-Request-Id')) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'X-Request-Id': uuidv4() } }));
};
