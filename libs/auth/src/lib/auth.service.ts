import { inject, Injectable, signal } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private configService = inject(ConfigService);

  isDoneLoading = signal(false);
  isAuthenticated = signal(false);

  async configure() {
    const config = this.configService.authConfig();

    const authConfig: AuthConfig = {
      issuer: config.issuer,
      redirectUri: window.location.origin,
      clientId: config.clientId,
      responseType: 'code',
      scope: 'openid profile email',
      showDebugInformation: true,
      useSilentRefresh: true,
    };

    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      this.isAuthenticated.set(this.oauthService.hasValidAccessToken());
    } catch (error) {
      console.error('Error during authentication:', error);
    } finally {
      this.isDoneLoading.set(true);
    }
  }

  public login() {
    this.oauthService.initCodeFlow();
  }

  public logout() {
    this.oauthService.logOut();
  }
}
