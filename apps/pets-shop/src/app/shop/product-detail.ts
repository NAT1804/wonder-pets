import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { ProductDto } from '@wonder-pets/contracts';
import { CartService } from '../core/cart.service';
import { ShopApiService } from '../core/shop-api.service';

@Component({
  selector: 'app-product-detail',
  imports: [DecimalPipe, FormsModule, RouterLink],
  template: `
    <div class="wp-container">
      <a class="back-link" routerLink="/home">← Quay lại cửa hàng</a>

      @if (isLoading()) {
        <div class="wp-card state-box">Đang tải thông tin sản phẩm...</div>
      } @else if (errorMessage() || !product()) {
        <div class="wp-alert-error">
          {{ errorMessage() || 'Không tìm thấy sản phẩm.' }}
        </div>
      } @else {
        @let p = product()!;
        <section class="detail-grid wp-card">
          <div class="gallery">
            @if (p.images.length > 0) {
              <img [src]="p.images[0]" [alt]="p.name" />
            } @else {
              <div class="gallery-placeholder">🐾</div>
            }
          </div>

          <div class="info">
            @if (p.category) {
              <span class="wp-badge">{{ p.category.name }}</span>
            }
            <h1>{{ p.name }}</h1>
            <div class="price">{{ +p.price | number: '1.0-0' }} ₫</div>
            <p class="stock-line">
              Tình trạng:
              <strong [class.out]="p.stock === 0">
                {{ p.stock > 0 ? 'Còn ' + p.stock + ' sản phẩm' : 'Hết hàng' }}
              </strong>
            </p>
            <p class="description">
              {{ p.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' }}
            </p>

            <div class="purchase-row">
              <input
                type="number"
                class="wp-input qty-input"
                min="1"
                [max]="p.stock"
                [ngModel]="quantity()"
                (ngModelChange)="quantity.set(+$event || 1)"
              />
              <button
                type="button"
                class="wp-btn wp-btn-primary"
                [disabled]="p.stock === 0"
                (click)="addToCart(p)"
              >
                {{ addedFeedback() ? 'Đã thêm vào giỏ ✓' : 'Thêm vào giỏ hàng' }}
              </button>
              <a class="wp-btn" routerLink="/cart">Xem giỏ hàng</a>
            </div>
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      text-decoration: none;
      font-weight: 600;
    }
    .state-box {
      padding: 2rem;
      text-align: center;
      color: var(--wp-muted);
    }
    .detail-grid {
      display: grid;
      grid-template-columns: minmax(260px, 1fr) 1.2fr;
      gap: 2rem;
      padding: 1.75rem;
    }
    @media (max-width: 768px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
    .gallery {
      border-radius: 12px;
      overflow: hidden;
      background: #f1f5f9;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .gallery img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .gallery-placeholder {
      font-size: 4.5rem;
    }
    .info h1 {
      margin: 0.6rem 0;
      font-size: 1.75rem;
    }
    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--wp-primary-dark);
      margin-bottom: 0.75rem;
    }
    .stock-line {
      margin: 0 0 1rem;
      color: var(--wp-muted);
    }
    .stock-line strong.out {
      color: var(--wp-danger);
    }
    .description {
      margin: 0 0 1.5rem;
      color: #334155;
      white-space: pre-line;
    }
    .purchase-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
    }
    .qty-input {
      width: 84px;
    }
  `,
})
export class ProductDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly shopApi = inject(ShopApiService);
  private readonly cartService = inject(CartService);

  readonly product = signal<ProductDto | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly addedFeedback = signal(false);

  ngOnInit(): void {
    const idOrSlug = this.route.snapshot.paramMap.get('idOrSlug');
    if (!idOrSlug) {
      this.errorMessage.set('Sản phẩm không hợp lệ.');
      this.isLoading.set(false);
      return;
    }

    this.shopApi.getProduct(idOrSlug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không tìm thấy sản phẩm.');
        this.isLoading.set(false);
      },
    });
  }

  addToCart(product: ProductDto): void {
    this.cartService.addItem(product, this.quantity());
    this.addedFeedback.set(true);
    setTimeout(() => this.addedFeedback.set(false), 1400);
  }
}
