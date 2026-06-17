import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../auth/auth.store';

export const adminGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  await auth.ensureSession();
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnTo: state.url } });
  }
  if (!auth.isAdmin()) {
    return router.createUrlTree(['/403']);
  }
  return true;
};
