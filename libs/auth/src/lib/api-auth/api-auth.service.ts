import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, firstValueFrom, Observable, of, tap } from 'rxjs';
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class ApiAuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = '/api/v1/auth';

  private readonly _accessToken = signal<string | null>(null);
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _isReady = signal(false);

  readonly accessToken = this._accessToken.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isReady = this._isReady.asReadonly();
  readonly isAuthenticated = computed(
    () => this._accessToken() !== null && this._user() !== null,
  );
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  async initSession(): Promise<void> {
    try {
      await firstValueFrom(this.refresh().pipe(catchError(() => of(null))));
    } finally {
      this._isReady.set(true);
    }
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/register`, payload, {
        withCredentials: true,
      })
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiBase}/login`, payload, {
        withCredentials: true,
      })
      .pipe(tap((res) => this.setSession(res)));
  }

  refresh(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.apiBase}/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): Observable<{ success: boolean }> {
    return this.http
      .post<{ success: boolean }>(
        `${this.apiBase}/logout`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of({ success: true });
        }),
      );
  }

  fetchMe(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(`${this.apiBase}/me`)
      .pipe(tap((user) => this._user.set(user)));
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
  }

  private setSession(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    this._user.set(res.user);
  }
}
