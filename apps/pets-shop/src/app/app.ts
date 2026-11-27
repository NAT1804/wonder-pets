import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { ApiAuthService } from '@wonder-pets/auth';
import { CartService } from './core/cart.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  readonly authService = inject(ApiAuthService);
  readonly cartService = inject(CartService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly user = this.authService.user;

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigateByUrl('/home');
    });
  }
}
