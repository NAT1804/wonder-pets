import { Route } from '@angular/router';

export const homeRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard').then((m) => m.Dashboard),
  },
];
