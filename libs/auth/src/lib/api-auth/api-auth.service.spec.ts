import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiAuthService } from './api-auth.service';
import type { AuthResponse } from './auth.models';

describe('ApiAuthService', () => {
  let service: ApiAuthService;
  let httpMock: HttpTestingController;

  const mockSession: AuthResponse = {
    accessToken: 'jwt-access-token',
    user: {
      id: 'user-1',
      email: 'alice@wonderpets.vn',
      fullName: 'Alice',
      phone: null,
      role: 'CUSTOMER',
      emailVerified: false,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should store access token and user after login', () => {
    service
      .login({ email: 'alice@wonderpets.vn', password: 'Password123!' })
      .subscribe();

    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mockSession);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.accessToken()).toBe('jwt-access-token');
    expect(service.user()?.email).toBe('alice@wonderpets.vn');
  });

  it('should clear session after logout', () => {
    service
      .login({ email: 'alice@wonderpets.vn', password: 'Password123!' })
      .subscribe();
    httpMock.expectOne('/api/v1/auth/login').flush(mockSession);

    service.logout().subscribe();
    const logoutReq = httpMock.expectOne('/api/v1/auth/logout');
    expect(logoutReq.request.withCredentials).toBe(true);
    logoutReq.flush({ success: true });

    expect(service.isAuthenticated()).toBe(false);
    expect(service.accessToken()).toBeNull();
    expect(service.user()).toBeNull();
  });
});
