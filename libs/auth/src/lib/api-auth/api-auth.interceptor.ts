import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { ApiAuthService } from './api-auth.service';

const AUTH_SKIP_REFRESH_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
];

export const apiAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ApiAuthService);
  const isApiRequest = req.url.startsWith('/api/');

  if (!isApiRequest) {
    return next(req);
  }

  const token = authService.accessToken();
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isUnauthorized =
        error instanceof HttpErrorResponse && error.status === 401;
      const shouldSkipRefresh = AUTH_SKIP_REFRESH_PATHS.some((path) =>
        req.url.includes(path),
      );

      if (!isUnauthorized || shouldSkipRefresh) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap((session) => {
          const retriedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          });
          return next(retriedReq);
        }),
        catchError((refreshError) => {
          authService.clearSession();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
