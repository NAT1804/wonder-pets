import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { AuthService, ConfigService } from '@wonder-pets/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideOAuthClient(),
    provideRouter(appRoutes),
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const authService = inject(AuthService);
      await configService.loadConfig();
      await authService.configure();
    }),
  ],
};
