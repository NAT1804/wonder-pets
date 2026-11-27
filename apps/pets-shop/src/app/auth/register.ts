import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiAuthService } from '@wonder-pets/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Đăng ký tài khoản</h1>
      <p class="subtitle">Tạo tài khoản mua sắm tại Wonder Pets</p>

      @if (errorMessage()) {
        <div class="alert-error">{{ errorMessage() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>
          <span>Họ và tên</span>
          <input
            type="text"
            formControlName="fullName"
            placeholder="Nguyễn Văn A"
            autocomplete="name"
          />
        </label>

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
          <span>Số điện thoại (tùy chọn)</span>
          <input
            type="tel"
            formControlName="phone"
            placeholder="0901234567"
            autocomplete="tel"
          />
        </label>

        <label>
          <span>Mật khẩu (tối thiểu 8 ký tự)</span>
          <input
            type="password"
            formControlName="password"
            placeholder="••••••••"
            autocomplete="new-password"
          />
        </label>

        <button type="submit" [disabled]="form.invalid || isSubmitting()">
          {{ isSubmitting() ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
        </button>
      </form>

      <p class="footer-link">
        Đã có tài khoản? <a routerLink="/login">Đăng nhập</a>
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
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(ApiAuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    this.authService
      .register({
        fullName: raw.fullName,
        email: raw.email,
        password: raw.password,
        phone: raw.phone || undefined,
      })
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/home');
        },
        error: (err) => {
          const msg = err?.error?.message;
          this.errorMessage.set(
            Array.isArray(msg)
              ? msg.join(', ')
              : msg || 'Không thể tạo tài khoản. Vui lòng thử lại.',
          );
          this.isSubmitting.set(false);
        },
      });
  }
}
