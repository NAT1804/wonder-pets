import { Route } from '@angular/router';

export const appWorkspaceRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('@wonder-pets/home').then((m) => m.Home),
    loadChildren: () => import('@wonder-pets/home').then((m) => m.homeRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@wonder-pets/page-not-found').then((m) => m.PageNotFound),
  },
];
