import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { PaginationMeta, ProductDto } from '@wonder-pets/contracts';
import { CartService } from '../core/cart.service';
import { CategoryWithCount, ShopApiService } from '../core/shop-api.service';

@Component({
  selector: 'app-product-list',
  imports: [DecimalPipe, FormsModule, RouterLink],
  template: `
    <div class="wp-container">
      <section class="hero">
        <div>
          <span class="hero-tag">Chăm sóc thú cưng chuẩn chuyên gia</span>
          <h1>Wonder Pets Shop</h1>
          <p>
            Thức ăn dinh dưỡng, phụ kiện và sản phẩm chăm sóc chính hãng cho chó
            mèo của bạn.
          </p>
        </div>
      </section>

      <section class="toolbar wp-card">
        <div class="category-pills">
          <button
            type="button"
            class="pill"
            [class.active]="selectedCategoryId() === ''"
            (click)="selectCategory('')"
          >
            Tất cả
          </button>
          @for (cat of categories(); track cat.id) {
            <button
              type="button"
              class="pill"
              [class.active]="selectedCategoryId() === cat.id"
              (click)="selectCategory(cat.id)"
            >
              {{ cat.name }}
            </button>
          }
        </div>

        <div class="filters">
          <input
            type="search"
            class="wp-input search-input"
            placeholder="Tìm kiếm thức ăn, phụ kiện..."
            [ngModel]="searchTerm()"
            (ngModelChange)="searchTerm.set($event)"
            (keyup.enter)="applyFilters()"
          />
          <select
            class="wp-select sort-select"
            [ngModel]="sortValue()"
            (ngModelChange)="onSortChange($event)"
          >
            <option value="createdAt:desc">Mới nhất</option>
            <option value="price:asc">Giá: Thấp đến cao</option>
            <option value="price:desc">Giá: Cao đến thấp</option>
            <option value="name:asc">Tên: A → Z</option>
          </select>
          <button
            type="button"
            class="wp-btn wp-btn-primary"
            (click)="applyFilters()"
          >
            Lọc
          </button>
        </div>
      </section>

      @if (errorMessage()) {
        <div class="wp-alert-error state-box">{{ errorMessage() }}</div>
      } @else if (isLoading()) {
        <div class="state-box wp-card">Đang tải danh sách sản phẩm...</div>
      } @else if (products().length === 0) {
        <div class="state-box wp-card">
          Không tìm thấy sản phẩm phù hợp. Hãy thử từ khóa hoặc danh mục khác.
        </div>
      } @else {
        <section class="product-grid">
          @for (product of products(); track product.id) {
            <article class="product-card wp-card">
              <a class="thumb" [routerLink]="['/products', product.slug]">
                @if (product.images.length > 0) {
                  <img [src]="product.images[0]" [alt]="product.name" />
                } @else {
                  <div class="thumb-placeholder">🐾</div>
                }
              </a>

              <div class="card-body">
                <div class="card-meta">
                  @if (product.category) {
                    <span class="wp-badge">{{ product.category.name }}</span>
                  }
                  <span
                    class="stock"
                    [class.out]="product.stock === 0"
                  >
                    {{
                      product.stock > 0
                        ? 'Còn ' + product.stock
                        : 'Hết hàng'
                    }}
                  </span>
                </div>

                <a
                  class="product-title"
                  [routerLink]="['/products', product.slug]"
                >
                  {{ product.name }}
                </a>

                @if (product.description) {
                  <p class="product-desc">{{ product.description }}</p>
                }

                <div class="card-footer">
                  <strong class="price">
                    {{ +product.price | number: '1.0-0' }} ₫
                  </strong>
                  <button
                    type="button"
                    class="wp-btn wp-btn-primary"
                    [disabled]="product.stock === 0"
                    (click)="addToCart(product)"
                  >
                    {{
                      justAddedId() === product.id
                        ? 'Đã thêm ✓'
                        : 'Thêm vào giỏ'
                    }}
                  </button>
                </div>
              </div>
            </article>
          }
        </section>

        @if (meta() && meta()!.totalPages > 1) {
          <nav class="pagination">
            <button
              type="button"
              class="wp-btn"
              [disabled]="page() <= 1"
              (click)="goToPage(page() - 1)"
            >
              ← Trang trước
            </button>
            <span class="page-info">
              Trang {{ page() }} / {{ meta()!.totalPages }}
            </span>
            <button
              type="button"
              class="wp-btn"
              [disabled]="page() >= meta()!.totalPages"
              (click)="goToPage(page() + 1)"
            >
              Trang sau →
            </button>
          </nav>
        }
      }
    </div>
  `,
  styles: `
    .hero {
      padding: 2rem;
      margin-bottom: 1.5rem;
      border-radius: 16px;
      background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%);
      color: #ffffff;
    }
    .hero-tag {
      display: inline-block;
      padding: 0.25rem 0.7rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.16);
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.65rem;
    }
    .hero h1 {
      margin: 0 0 0.4rem;
      font-size: 1.9rem;
    }
    .hero p {
      margin: 0;
      opacity: 0.92;
      max-width: 600px;
    }
    .toolbar {
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }
    .category-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .pill {
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--wp-border);
      background: #ffffff;
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--wp-muted);
      cursor: pointer;
    }
    .pill.active {
      background: var(--wp-primary);
      border-color: var(--wp-primary);
      color: #ffffff;
    }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }
    .search-input {
      flex: 1 1 240px;
    }
    .sort-select {
      flex: 0 0 190px;
    }
    .state-box {
      padding: 2.5rem 1.5rem;
      text-align: center;
      color: var(--wp-muted);
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .thumb {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 190px;
      background: #f1f5f9;
      text-decoration: none;
      overflow: hidden;
    }
    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .thumb-placeholder {
      font-size: 3rem;
    }
    .card-body {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.5rem;
    }
    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .stock {
      font-size: 0.8rem;
      color: var(--wp-success);
      font-weight: 600;
    }
    .stock.out {
      color: var(--wp-danger);
    }
    .product-title {
      font-weight: 700;
      font-size: 1rem;
      color: var(--wp-text);
      text-decoration: none;
    }
    .product-title:hover {
      color: var(--wp-primary);
    }
    .product-desc {
      margin: 0;
      font-size: 0.86rem;
      color: var(--wp-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-footer {
      margin-top: auto;
      padding-top: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .price {
      font-size: 1.05rem;
      color: var(--wp-primary-dark);
    }
    .pagination {
      margin-top: 1.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    .page-info {
      font-size: 0.9rem;
      color: var(--wp-muted);
      font-weight: 500;
    }
  `,
})
export class ProductList implements OnInit {
  private readonly shopApi = inject(ShopApiService);
  private readonly cartService = inject(CartService);

  readonly categories = signal<CategoryWithCount[]>([]);
  readonly products = signal<ProductDto[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly selectedCategoryId = signal('');
  readonly searchTerm = signal('');
  readonly sortValue = signal('createdAt:desc');
  readonly page = signal(1);
  readonly justAddedId = signal<string | null>(null);

  ngOnInit(): void {
    this.shopApi.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => {
        // Categories are optional for rendering product list
      },
    });
    this.loadProducts();
  }

  selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
    this.page.set(1);
    this.loadProducts();
  }

  onSortChange(value: string): void {
    this.sortValue.set(value);
    this.page.set(1);
    this.loadProducts();
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadProducts();
  }

  goToPage(nextPage: number): void {
    this.page.set(nextPage);
    this.loadProducts();
  }

  addToCart(product: ProductDto): void {
    this.cartService.addItem(product, 1);
    this.justAddedId.set(product.id);
    setTimeout(() => {
      if (this.justAddedId() === product.id) {
        this.justAddedId.set(null);
      }
    }, 1200);
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const [sortBy, sortOrder] = this.sortValue().split(':') as [
      'createdAt' | 'price' | 'name',
      'asc' | 'desc',
    ];

    this.shopApi
      .getProducts({
        categoryId: this.selectedCategoryId() || undefined,
        search: this.searchTerm().trim() || undefined,
        sortBy,
        sortOrder,
        page: this.page(),
        limit: 12,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.items);
          this.meta.set(res.meta);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'Không thể tải danh sách sản phẩm. Hãy đảm bảo API backend đang chạy.',
          );
          this.isLoading.set(false);
        },
      });
  }
}
