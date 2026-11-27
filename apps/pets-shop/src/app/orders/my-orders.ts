import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { OrderDto, OrderStatus } from '@wonder-pets/contracts';
import { ShopApiService } from '../core/shop-api.service';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

@Component({
  selector: 'app-my-orders',
  imports: [DatePipe, DecimalPipe, RouterLink],
  template: `
    <div class="wp-container">
      <div class="page-header">
        <h1>Đơn hàng của tôi</h1>
        <a class="wp-btn" routerLink="/home">Tiếp tục mua sắm</a>
      </div>

      @if (errorMessage()) {
        <div class="wp-alert-error">{{ errorMessage() }}</div>
      } @else if (isLoading()) {
        <div class="wp-card state-box">Đang tải lịch sử đơn hàng...</div>
      } @else if (orders().length === 0) {
        <div class="wp-card state-box">
          <p>Bạn chưa có đơn hàng nào.</p>
          <a class="wp-btn wp-btn-primary" routerLink="/home">Khám phá sản phẩm</a>
        </div>
      } @else {
        <div class="order-list">
          @for (order of orders(); track order.id) {
            <article class="wp-card order-card">
              <div class="order-head">
                <div>
                  <strong>Mã đơn: {{ order.id.slice(0, 8).toUpperCase() }}</strong>
                  <span class="order-date">
                    {{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                  </span>
                </div>
                <span
                  class="wp-badge"
                  [class]="'wp-badge wp-badge-' + order.status.toLowerCase()"
                >
                  {{ statusLabel(order.status) }}
                </span>
              </div>

              <div class="order-items">
                @for (item of order.items; track item.id) {
                  <div class="order-item-row">
                    <span>
                      {{ item.product?.name || item.productId }} ×
                      {{ item.quantity }}
                    </span>
                    <span>
                      {{ +item.unitPrice * item.quantity | number: '1.0-0' }} ₫
                    </span>
                  </div>
                }
              </div>

              <div class="order-foot">
                <div class="shipping-meta">
                  <span>Giao tới: {{ order.shippingAddress }}</span>
                  <span>SĐT: {{ order.phone }}</span>
                </div>
                <strong class="order-total">
                  Tổng: {{ +order.totalAmount | number: '1.0-0' }} ₫
                </strong>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .page-header h1 {
      margin: 0;
      font-size: 1.6rem;
    }
    .state-box {
      padding: 2.5rem;
      text-align: center;
      color: var(--wp-muted);
    }
    .order-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .order-card {
      padding: 1.25rem;
    }
    .order-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--wp-border);
      gap: 1rem;
    }
    .order-date {
      margin-left: 0.75rem;
      font-size: 0.85rem;
      color: var(--wp-muted);
    }
    .order-items {
      padding: 0.85rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .order-item-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.92rem;
    }
    .order-foot {
      padding-top: 0.75rem;
      border-top: 1px solid var(--wp-border);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }
    .shipping-meta {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
      color: var(--wp-muted);
    }
    .order-total {
      font-size: 1.05rem;
      color: var(--wp-primary-dark);
    }
  `,
})
export class MyOrders implements OnInit {
  private readonly shopApi = inject(ShopApiService);

  readonly orders = signal<OrderDto[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.shopApi.getMyOrders().subscribe({
      next: (res) => {
        this.orders.set(res.items);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không thể tải danh sách đơn hàng.');
        this.isLoading.set(false);
      },
    });
  }

  statusLabel(status: OrderStatus): string {
    return STATUS_LABELS[status];
  }
}
