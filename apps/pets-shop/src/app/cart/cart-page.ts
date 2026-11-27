import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiAuthService } from '@wonder-pets/auth';
import { CartService } from '../core/cart.service';
import { ShopApiService } from '../core/shop-api.service';

@Component({
  selector: 'app-cart-page',
  imports: [DecimalPipe, ReactiveFormsModule, RouterLink],
  template: `
    <div class="wp-container">
      <h1>Giỏ hàng của bạn</h1>

      @if (cartService.items().length === 0) {
        <section class="wp-card empty-box">
          <p>Giỏ hàng hiện đang trống.</p>
          <a class="wp-btn wp-btn-primary" routerLink="/home">
            Tiếp tục mua sắm
          </a>
        </section>
      } @else {
        <div class="cart-layout">
          <section class="wp-card items-panel">
            @for (item of cartService.items(); track item.product.id) {
              <div class="cart-row">
                <div class="item-info">
                  <a
                    class="item-name"
                    [routerLink]="['/products', item.product.slug]"
                  >
                    {{ item.product.name }}
                  </a>
                  <span class="item-price">
                    {{ +item.product.price | number: '1.0-0' }} ₫ / sản phẩm
                  </span>
                </div>

                <div class="item-actions">
                  <button
                    type="button"
                    class="wp-btn qty-btn"
                    (click)="
                      cartService.updateQuantity(
                        item.product.id,
                        item.quantity - 1
                      )
                    "
                  >
                    −
                  </button>
                  <span class="qty-val">{{ item.quantity }}</span>
                  <button
                    type="button"
                    class="wp-btn qty-btn"
                    [disabled]="item.quantity >= item.product.stock"
                    (click)="
                      cartService.updateQuantity(
                        item.product.id,
                        item.quantity + 1
                      )
                    "
                  >
                    +
                  </button>
                  <strong class="line-total">
                    {{ +item.product.price * item.quantity | number: '1.0-0' }} ₫
                  </strong>
                  <button
                    type="button"
                    class="wp-btn wp-btn-danger"
                    (click)="cartService.removeItem(item.product.id)"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            }
          </section>

          <aside class="wp-card checkout-panel">
            <h2>Thông tin đặt hàng</h2>

            <div class="summary-row">
              <span>Tổng số lượng</span>
              <strong>{{ cartService.totalCount() }} sản phẩm</strong>
            </div>
            <div class="summary-row total">
              <span>Tổng thanh toán</span>
              <strong>
                {{ cartService.totalAmount() | number: '1.0-0' }} ₫
              </strong>
            </div>

            @if (!authService.isAuthenticated()) {
              <div class="login-prompt">
                <p>Vui lòng đăng nhập để hoàn tất đặt hàng.</p>
                <a
                  class="wp-btn wp-btn-primary full-btn"
                  routerLink="/login"
                  [queryParams]="{ returnUrl: '/cart' }"
                >
                  Đăng nhập để đặt hàng
                </a>
              </div>
            } @else {
              @if (errorMessage()) {
                <div class="wp-alert-error">{{ errorMessage() }}</div>
              }

              <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
                <label class="field">
                  <span>Địa chỉ giao hàng</span>
                  <input
                    type="text"
                    class="wp-input"
                    formControlName="shippingAddress"
                    placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                  />
                </label>

                <label class="field">
                  <span>Số điện thoại nhận hàng</span>
                  <input
                    type="tel"
                    class="wp-input"
                    formControlName="phone"
                    placeholder="0901234567"
                  />
                </label>

                <label class="field">
                  <span>Ghi chú (tùy chọn)</span>
                  <textarea
                    class="wp-textarea"
                    rows="2"
                    formControlName="note"
                    placeholder="Giao giờ hành chính..."
                  ></textarea>
                </label>

                <button
                  type="submit"
                  class="wp-btn wp-btn-primary full-btn"
                  [disabled]="checkoutForm.invalid || isSubmitting()"
                >
                  {{ isSubmitting() ? 'Đang gửi đơn...' : 'Xác nhận đặt hàng' }}
                </button>
              </form>
            }
          </aside>
        </div>
      }
    </div>
  `,
  styles: `
    h1 {
      margin: 0 0 1.25rem;
      font-size: 1.6rem;
    }
    .empty-box {
      padding: 3rem 1.5rem;
      text-align: center;
      color: var(--wp-muted);
    }
    .cart-layout {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }
    @media (max-width: 860px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }
    .items-panel {
      padding: 0.5rem 1.25rem;
    }
    .cart-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--wp-border);
    }
    .cart-row:last-child {
      border-bottom: none;
    }
    .item-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .item-name {
      font-weight: 700;
      color: var(--wp-text);
      text-decoration: none;
    }
    .item-price {
      font-size: 0.85rem;
      color: var(--wp-muted);
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .qty-btn {
      padding: 0.3rem 0.65rem;
    }
    .qty-val {
      min-width: 24px;
      text-align: center;
      font-weight: 600;
    }
    .line-total {
      min-width: 105px;
      text-align: right;
      color: var(--wp-primary-dark);
    }
    .checkout-panel {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .checkout-panel h2 {
      margin: 0;
      font-size: 1.2rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
    }
    .summary-row.total {
      padding-top: 0.75rem;
      border-top: 1px solid var(--wp-border);
      font-size: 1.1rem;
      color: var(--wp-primary-dark);
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.88rem;
      font-weight: 600;
    }
    .full-btn {
      width: 100%;
    }
    .login-prompt p {
      margin: 0 0 0.75rem;
      color: var(--wp-muted);
      font-size: 0.9rem;
    }
  `,
})
export class CartPage {
  private readonly fb = inject(FormBuilder);
  private readonly shopApi = inject(ShopApiService);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly authService = inject(ApiAuthService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly checkoutForm = this.fb.nonNullable.group({
    shippingAddress: ['', [Validators.required, Validators.minLength(5)]],
    phone: [
      this.authService.user()?.phone ?? '',
      [Validators.required, Validators.minLength(8)],
    ],
    note: [''],
  });

  placeOrder(): void {
    if (this.checkoutForm.invalid || this.isSubmitting()) {
      return;
    }

    const items = this.cartService.items().map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    if (items.length === 0) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const raw = this.checkoutForm.getRawValue();
    this.shopApi
      .createOrder({
        shippingAddress: raw.shippingAddress,
        phone: raw.phone,
        note: raw.note || undefined,
        items,
      })
      .subscribe({
        next: () => {
          this.cartService.clear();
          this.router.navigateByUrl('/orders');
        },
        error: (err) => {
          const msg = err?.error?.message;
          this.errorMessage.set(
            Array.isArray(msg)
              ? msg.join(', ')
              : msg || 'Đặt hàng thất bại. Vui lòng kiểm tra lại tồn kho.',
          );
          this.isSubmitting.set(false);
        },
      });
  }
}
