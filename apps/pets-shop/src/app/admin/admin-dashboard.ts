import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import type {
  AllowedImageContentType,
  OrderDto,
  OrderStatus,
  ProductDto,
} from '@wonder-pets/contracts';
import { firstValueFrom } from 'rxjs';
import { CategoryWithCount, ShopApiService } from '../core/shop-api.service';

type AdminTab = 'products' | 'categories' | 'orders';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'SHIPPING',
  'COMPLETED',
  'CANCELLED',
];

@Component({
  selector: 'app-admin-dashboard',
  imports: [DatePipe, DecimalPipe, FormsModule, ReactiveFormsModule],
  template: `
    <div class="wp-container">
      <div class="admin-head">
        <div>
          <h1>Trang quản trị Wonder Pets</h1>
          <p class="muted">
            Quản lý sản phẩm, danh mục, ảnh R2 và trạng thái đơn hàng.
          </p>
        </div>
        <div class="tabs">
          <button
            type="button"
            class="wp-btn"
            [class.wp-btn-primary]="activeTab() === 'products'"
            (click)="activeTab.set('products')"
          >
            Sản phẩm ({{ products().length }})
          </button>
          <button
            type="button"
            class="wp-btn"
            [class.wp-btn-primary]="activeTab() === 'categories'"
            (click)="activeTab.set('categories')"
          >
            Danh mục ({{ categories().length }})
          </button>
          <button
            type="button"
            class="wp-btn"
            [class.wp-btn-primary]="activeTab() === 'orders'"
            (click)="activeTab.set('orders')"
          >
            Đơn hàng ({{ orders().length }})
          </button>
        </div>
      </div>

      @if (feedbackMessage()) {
        <div class="wp-alert-success banner">{{ feedbackMessage() }}</div>
      }
      @if (errorMessage()) {
        <div class="wp-alert-error banner">{{ errorMessage() }}</div>
      }

      <!-- TAB: PRODUCTS -->
      @if (activeTab() === 'products') {
        <section class="split-grid">
          <div class="wp-card panel">
            <h2>
              {{
                editingProductId() ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'
              }}
            </h2>
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <label class="field">
                <span>Tên sản phẩm</span>
                <input
                  type="text"
                  class="wp-input"
                  formControlName="name"
                  placeholder="Royal Canin Medium Adult 4kg"
                />
              </label>

              <label class="field">
                <span>Danh mục</span>
                <select class="wp-select" formControlName="categoryId">
                  <option value="">-- Chọn danh mục --</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </label>

              <div class="row-2">
                <label class="field">
                  <span>Giá (VNĐ)</span>
                  <input
                    type="number"
                    class="wp-input"
                    formControlName="price"
                    min="0"
                  />
                </label>
                <label class="field">
                  <span>Tồn kho</span>
                  <input
                    type="number"
                    class="wp-input"
                    formControlName="stock"
                    min="0"
                  />
                </label>
              </div>

              <label class="field">
                <span>Mô tả</span>
                <textarea
                  class="wp-textarea"
                  rows="3"
                  formControlName="description"
                ></textarea>
              </label>

              <label class="field">
                <span>URL ảnh sản phẩm (hoặc tải lên Cloudflare R2)</span>
                <input
                  type="url"
                  class="wp-input"
                  formControlName="imageUrl"
                  placeholder="https://media.wonderpets.vn/..."
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  (change)="onImageSelected($event)"
                />
                @if (isUploadingImage()) {
                  <small class="muted">Đang tải ảnh lên Cloudflare R2...</small>
                }
              </label>

              <label class="checkbox-field">
                <input type="checkbox" formControlName="isActive" />
                <span>Hiển thị trên cửa hàng</span>
              </label>

              <div class="form-actions">
                <button
                  type="submit"
                  class="wp-btn wp-btn-primary"
                  [disabled]="productForm.invalid || isSaving()"
                >
                  {{
                    editingProductId() ? 'Lưu thay đổi' : 'Tạo sản phẩm'
                  }}
                </button>
                @if (editingProductId()) {
                  <button
                    type="button"
                    class="wp-btn"
                    (click)="resetProductForm()"
                  >
                    Hủy sửa
                  </button>
                }
              </div>
            </form>
          </div>

          <div class="wp-card panel">
            <h2>Danh sách sản phẩm</h2>
            <div class="wp-table-wrap">
              <table class="wp-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  @for (p of products(); track p.id) {
                    <tr>
                      <td>
                        <strong>{{ p.name }}</strong>
                        <div class="sub">{{ p.category?.name || '-' }}</div>
                      </td>
                      <td>{{ +p.price | number: '1.0-0' }} ₫</td>
                      <td>{{ p.stock }}</td>
                      <td>
                        <span
                          class="wp-badge"
                          [class.wp-badge-completed]="p.isActive"
                          [class.wp-badge-cancelled]="!p.isActive"
                        >
                          {{ p.isActive ? 'Đang bán' : 'Đã ẩn' }}
                        </span>
                      </td>
                      <td class="actions-cell">
                        <button
                          type="button"
                          class="wp-btn"
                          (click)="editProduct(p)"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          class="wp-btn wp-btn-danger"
                          (click)="deleteProduct(p)"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </section>
      }

      <!-- TAB: CATEGORIES -->
      @if (activeTab() === 'categories') {
        <section class="split-grid">
          <div class="wp-card panel">
            <h2>
              {{
                editingCategoryId() ? 'Cập nhật danh mục' : 'Thêm danh mục mới'
              }}
            </h2>
            <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
              <label class="field">
                <span>Tên danh mục</span>
                <input
                  type="text"
                  class="wp-input"
                  formControlName="name"
                  placeholder="Phụ kiện cho mèo"
                />
              </label>
              <label class="field">
                <span>Mô tả</span>
                <textarea
                  class="wp-textarea"
                  rows="3"
                  formControlName="description"
                ></textarea>
              </label>
              <div class="form-actions">
                <button
                  type="submit"
                  class="wp-btn wp-btn-primary"
                  [disabled]="categoryForm.invalid || isSaving()"
                >
                  {{
                    editingCategoryId() ? 'Lưu thay đổi' : 'Tạo danh mục'
                  }}
                </button>
                @if (editingCategoryId()) {
                  <button
                    type="button"
                    class="wp-btn"
                    (click)="resetCategoryForm()"
                  >
                    Hủy sửa
                  </button>
                }
              </div>
            </form>
          </div>

          <div class="wp-card panel">
            <h2>Danh sách danh mục</h2>
            <div class="wp-table-wrap">
              <table class="wp-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Slug</th>
                    <th>Số SP</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of categories(); track c.id) {
                    <tr>
                      <td><strong>{{ c.name }}</strong></td>
                      <td><code>{{ c.slug }}</code></td>
                      <td>{{ c._count?.products ?? 0 }}</td>
                      <td class="actions-cell">
                        <button
                          type="button"
                          class="wp-btn"
                          (click)="editCategory(c)"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          class="wp-btn wp-btn-danger"
                          (click)="deleteCategory(c)"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </section>
      }

      <!-- TAB: ORDERS -->
      @if (activeTab() === 'orders') {
        <section class="wp-card panel">
          <div class="orders-toolbar">
            <h2>Quản lý đơn hàng</h2>
            <select
              class="wp-select status-filter"
              [ngModel]="orderStatusFilter()"
              (ngModelChange)="onOrderFilterChange($event)"
            >
              <option value="">Tất cả trạng thái</option>
              @for (st of orderStatuses; track st) {
                <option [value]="st">{{ st }}</option>
              }
            </select>
          </div>

          <div class="wp-table-wrap">
            <table class="wp-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày tạo</th>
                  <th>Giao hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td>
                      <strong>{{ order.id.slice(0, 8).toUpperCase() }}</strong>
                      <div class="sub">{{ order.items.length }} mặt hàng</div>
                    </td>
                    <td>{{ order.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <div>{{ order.phone }}</div>
                      <div class="sub">{{ order.shippingAddress }}</div>
                    </td>
                    <td>
                      <strong>
                        {{ +order.totalAmount | number: '1.0-0' }} ₫
                      </strong>
                    </td>
                    <td>
                      <select
                        class="wp-select status-select"
                        [ngModel]="order.status"
                        (ngModelChange)="updateOrderStatus(order, $event)"
                        [disabled]="
                          order.status === 'CANCELLED' ||
                          order.status === 'COMPLETED'
                        "
                      >
                        @for (st of orderStatuses; track st) {
                          <option [value]="st">{{ st }}</option>
                        }
                      </select>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .admin-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .admin-head h1 {
      margin: 0 0 0.2rem;
      font-size: 1.6rem;
    }
    .muted {
      margin: 0;
      color: var(--wp-muted);
      font-size: 0.9rem;
    }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .banner {
      margin-bottom: 1rem;
    }
    .split-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 1.25rem;
      align-items: start;
    }
    @media (max-width: 960px) {
      .split-grid {
        grid-template-columns: 1fr;
      }
    }
    .panel {
      padding: 1.25rem;
    }
    .panel h2 {
      margin: 0 0 1rem;
      font-size: 1.15rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.86rem;
      font-weight: 600;
    }
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .form-actions {
      display: flex;
      gap: 0.6rem;
      margin-top: 0.25rem;
    }
    .sub {
      font-size: 0.8rem;
      color: var(--wp-muted);
    }
    .actions-cell {
      display: flex;
      gap: 0.4rem;
    }
    .orders-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .orders-toolbar h2 {
      margin: 0;
    }
    .status-filter,
    .status-select {
      width: auto;
      min-width: 150px;
    }
  `,
})
export class AdminDashboard implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly shopApi = inject(ShopApiService);

  readonly orderStatuses = ORDER_STATUSES;
  readonly activeTab = signal<AdminTab>('products');
  readonly products = signal<ProductDto[]>([]);
  readonly categories = signal<CategoryWithCount[]>([]);
  readonly orders = signal<OrderDto[]>([]);
  readonly orderStatusFilter = signal<OrderStatus | ''>('');

  readonly editingProductId = signal<string | null>(null);
  readonly editingCategoryId = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly isUploadingImage = signal(false);
  readonly feedbackMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly productForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    categoryId: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    imageUrl: [''],
    isActive: [true],
  });

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loadCategories();
    this.loadProducts();
    this.loadOrders();
  }

  private loadCategories(): void {
    this.shopApi.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
    });
  }

  private loadProducts(): void {
    this.shopApi.getProducts({ onlyActive: false, limit: 100 }).subscribe({
      next: (res) => this.products.set(res.items),
    });
  }

  private loadOrders(): void {
    const status = this.orderStatusFilter() || undefined;
    this.shopApi.getAllOrders(status, 1, 50).subscribe({
      next: (res) => this.orders.set(res.items),
    });
  }

  // --- Product actions ---
  editProduct(product: ProductDto): void {
    this.editingProductId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      categoryId: product.categoryId,
      price: Number(product.price),
      stock: product.stock,
      description: product.description ?? '',
      imageUrl: product.images[0] ?? '',
      isActive: product.isActive,
    });
  }

  resetProductForm(): void {
    this.editingProductId.set(null);
    this.productForm.reset({
      name: '',
      categoryId: '',
      price: 0,
      stock: 0,
      description: '',
      imageUrl: '',
      isActive: true,
    });
  }

  saveProduct(): void {
    if (this.productForm.invalid || this.isSaving()) return;
    this.isSaving.set(true);
    this.clearAlerts();

    const raw = this.productForm.getRawValue();
    const payload = {
      name: raw.name,
      categoryId: raw.categoryId,
      price: Number(raw.price),
      stock: Number(raw.stock),
      description: raw.description || undefined,
      images: raw.imageUrl ? [raw.imageUrl] : [],
      isActive: raw.isActive,
    };

    const editingId = this.editingProductId();
    const request$ = editingId
      ? this.shopApi.updateProduct(editingId, payload)
      : this.shopApi.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.feedbackMessage.set(
          editingId ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm mới.',
        );
        this.resetProductForm();
        this.loadProducts();
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Không thể lưu sản phẩm.',
        );
        this.isSaving.set(false);
      },
    });
  }

  deleteProduct(product: ProductDto): void {
    this.clearAlerts();
    this.shopApi.deleteProduct(product.id).subscribe({
      next: (res) => {
        this.feedbackMessage.set(
          res.deactivated
            ? `Sản phẩm "${product.name}" đã được ẩn vì có liên kết đơn hàng.`
            : `Đã xóa sản phẩm "${product.name}".`,
        );
        this.loadProducts();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Không thể xóa sản phẩm.');
      },
    });
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUploadingImage.set(true);
    this.clearAlerts();

    try {
      const presigned = await firstValueFrom(
        this.shopApi.presignUpload({
          folder: 'products',
          contentType: file.type as AllowedImageContentType,
        }),
      );

      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      this.productForm.patchValue({ imageUrl: presigned.publicUrl });
      this.feedbackMessage.set('Tải ảnh lên Cloudflare R2 thành công.');
    } catch {
      this.errorMessage.set(
        'Không thể tải ảnh lên R2 (kiểm tra cấu hình R2_* ở backend hoặc nhập URL ảnh thủ công).',
      );
    } finally {
      this.isUploadingImage.set(false);
      input.value = '';
    }
  }

  // --- Category actions ---
  editCategory(category: CategoryWithCount): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description ?? '',
    });
  }

  resetCategoryForm(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ name: '', description: '' });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid || this.isSaving()) return;
    this.isSaving.set(true);
    this.clearAlerts();

    const raw = this.categoryForm.getRawValue();
    const editingId = this.editingCategoryId();
    const request$ = editingId
      ? this.shopApi.updateCategory(editingId, raw)
      : this.shopApi.createCategory(raw);

    request$.subscribe({
      next: () => {
        this.feedbackMessage.set(
          editingId ? 'Đã cập nhật danh mục.' : 'Đã tạo danh mục mới.',
        );
        this.resetCategoryForm();
        this.loadCategories();
        this.isSaving.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Không thể lưu danh mục.',
        );
        this.isSaving.set(false);
      },
    });
  }

  deleteCategory(category: CategoryWithCount): void {
    this.clearAlerts();
    this.shopApi.deleteCategory(category.id).subscribe({
      next: () => {
        this.feedbackMessage.set(`Đã xóa danh mục "${category.name}".`);
        this.loadCategories();
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Không thể xóa danh mục.',
        );
      },
    });
  }

  // --- Order actions ---
  onOrderFilterChange(status: OrderStatus | ''): void {
    this.orderStatusFilter.set(status);
    this.loadOrders();
  }

  updateOrderStatus(order: OrderDto, status: OrderStatus): void {
    this.clearAlerts();
    this.shopApi.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.feedbackMessage.set(
          `Đã cập nhật trạng thái đơn ${order.id.slice(0, 8).toUpperCase()} → ${status}.`,
        );
        this.loadOrders();
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Không thể cập nhật trạng thái đơn hàng.',
        );
        this.loadOrders();
      },
    });
  }

  private clearAlerts(): void {
    this.feedbackMessage.set(null);
    this.errorMessage.set(null);
  }
}
