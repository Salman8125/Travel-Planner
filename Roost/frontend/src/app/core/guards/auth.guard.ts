import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../auth/auth.store';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  await auth.ensureSession();
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnTo: state.url } });
  }
  return true;
};
