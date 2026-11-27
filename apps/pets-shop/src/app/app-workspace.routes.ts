import { Route } from '@angular/router';
import { apiAuthGuard, apiRoleGuard } from '@wonder-pets/auth';

export const appWorkspaceRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./shop/product-list').then((m) => m.ProductList),
  },
  {
    path: 'products/:idOrSlug',
    loadComponent: () =>
      import('./shop/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'orders',
    canActivate: [apiAuthGuard],
    loadComponent: () =>
      import('./orders/my-orders').then((m) => m.MyOrders),
  },
  {
    path: 'admin',
    canActivate: [apiRoleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./admin/admin-dashboard').then((m) => m.AdminDashboard),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@wonder-pets/page-not-found').then((m) => m.PageNotFound),
  },
];
