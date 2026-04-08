import { Route } from '@angular/router';
import { authGuard } from '@wonder-pets/auth';

export const appRoutes: Route[] = [
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./app-workspace.routes').then((m) => m.appWorkspaceRoutes),
  },
];
