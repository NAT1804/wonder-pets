import { Route } from '@angular/router';
import { guestOnlyGuard } from '@wonder-pets/auth';

export const appRoutes: Route[] = [
  {
    path: 'login',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./auth/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./auth/register').then((m) => m.Register),
  },
  {
    path: '',
    loadChildren: () =>
      import('./app-workspace.routes').then((m) => m.appWorkspaceRoutes),
  },
];
