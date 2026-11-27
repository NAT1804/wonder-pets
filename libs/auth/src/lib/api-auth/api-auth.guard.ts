import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiAuthService } from './api-auth.service';
import type { UserRole } from './auth.models';

export const apiAuthGuard: CanActivateFn = (_route, state) => {
  const authService = inject(ApiAuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

export const guestOnlyGuard: CanActivateFn = () => {
  const authService = inject(ApiAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/home']);
};

export const apiRoleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (_route, state) => {
    const authService = inject(ApiAuthService);
    const router = inject(Router);
    const user = authService.user();

    if (!authService.isAuthenticated() || !user) {
      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    return router.createUrlTree(['/home']);
  };
};
