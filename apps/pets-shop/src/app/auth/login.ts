import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiAuthService } from '@wonder-pets/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Đăng nhập</h1>
      <p class="subtitle">Chào mừng bạn quay lại Wonder Pets</p>

      @if (errorMessage()) {
        <div class="alert-error">{{ errorMessage() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          <span>Email</span>
          <input
            type="email"
            formControlName="email"
            placeholder="customer@wonderpets.vn"
            autocomplete="email"
          />
        </label>

        <label>
          <span>Mật khẩu</span>
          <input
            type="password"
            formControlName="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </label>

        <button type="submit" [disabled]="form.invalid || isSubmitting()">
          {{ isSubmitting() ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="footer-link">
        Chưa có tài khoản? <a routerLink="/register">Đăng ký ngay</a>
      </p>
    </section>
  `,
  styles: `
    .auth-card {
      max-width: 420px;
      margin: 3rem auto;
      padding: 2rem;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }
    h1 {
      margin: 0 0 0.25rem;
      font-size: 1.5rem;
    }
    .subtitle {
      margin: 0 0 1.5rem;
      color: #6b7280;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    input {
      padding: 0.65rem 0.8rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
    }
    button {
      margin-top: 0.5rem;
      padding: 0.75rem;
      border: none;
      border-radius: 8px;
      background: #2563eb;
      color: #ffffff;
      font-weight: 600;
      cursor: pointer;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .alert-error {
      margin-bottom: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      background: #fef2f2;
      color: #b91c1c;
      font-size: 0.9rem;
    }
    .footer-link {
      margin-top: 1.25rem;
      text-align: center;
      font-size: 0.9rem;
    }
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(ApiAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Email hoặc mật khẩu không đúng.',
        );
        this.isSubmitting.set(false);
      },
    });
  }
}
