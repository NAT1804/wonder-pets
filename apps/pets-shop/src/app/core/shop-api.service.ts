import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  CategoryDto,
  CreateCategoryRequest,
  CreateOrderRequest,
  CreateProductRequest,
  OrderDto,
  OrderStatus,
  PaginatedResponse,
  PresignUploadRequest,
  PresignUploadResponse,
  ProductDto,
  ProductQueryParams,
  UpdateCategoryRequest,
  UpdateProductRequest,
} from '@wonder-pets/contracts';
import { Observable } from 'rxjs';

export interface CategoryWithCount extends CategoryDto {
  _count?: {
    products: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ShopApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1';

  // --- Categories ---
  getCategories(): Observable<CategoryWithCount[]> {
    return this.http.get<CategoryWithCount[]>(`${this.base}/categories`);
  }

  createCategory(payload: CreateCategoryRequest): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(`${this.base}/categories`, payload);
  }

  updateCategory(
    id: string,
    payload: UpdateCategoryRequest,
  ): Observable<CategoryDto> {
    return this.http.patch<CategoryDto>(
      `${this.base}/categories/${id}`,
      payload,
    );
  }

  deleteCategory(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(
      `${this.base}/categories/${id}`,
    );
  }

  // --- Products ---
  getProducts(
    query: ProductQueryParams & { onlyActive?: boolean } = {},
  ): Observable<PaginatedResponse<ProductDto>> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.categoryId) params = params.set('categoryId', query.categoryId);
    if (query.minPrice !== undefined)
      params = params.set('minPrice', String(query.minPrice));
    if (query.maxPrice !== undefined)
      params = params.set('maxPrice', String(query.maxPrice));
    if (query.onlyActive !== undefined)
      params = params.set('onlyActive', String(query.onlyActive));
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.limit !== undefined)
      params = params.set('limit', String(query.limit));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.http.get<PaginatedResponse<ProductDto>>(
      `${this.base}/products`,
      { params },
    );
  }

  getProduct(idOrSlug: string): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.base}/products/${idOrSlug}`);
  }

  createProduct(payload: CreateProductRequest): Observable<ProductDto> {
    return this.http.post<ProductDto>(`${this.base}/products`, payload);
  }

  updateProduct(
    id: string,
    payload: UpdateProductRequest,
  ): Observable<ProductDto> {
    return this.http.patch<ProductDto>(`${this.base}/products/${id}`, payload);
  }

  deleteProduct(
    id: string,
  ): Observable<{ deleted: boolean; deactivated: boolean }> {
    return this.http.delete<{ deleted: boolean; deactivated: boolean }>(
      `${this.base}/products/${id}`,
    );
  }

  // --- Orders ---
  createOrder(payload: CreateOrderRequest): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.base}/orders`, payload);
  }

  getMyOrders(
    page = 1,
    limit = 20,
  ): Observable<PaginatedResponse<OrderDto>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    return this.http.get<PaginatedResponse<OrderDto>>(
      `${this.base}/orders/my`,
      { params },
    );
  }

  getAllOrders(
    status?: OrderStatus,
    page = 1,
    limit = 20,
  ): Observable<PaginatedResponse<OrderDto>> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));
    if (status) params = params.set('status', status);
    return this.http.get<PaginatedResponse<OrderDto>>(`${this.base}/orders`, {
      params,
    });
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<OrderDto> {
    return this.http.patch<OrderDto>(`${this.base}/orders/${id}/status`, {
      status,
    });
  }

  // --- Storage (Cloudflare R2) ---
  presignUpload(
    payload: PresignUploadRequest,
  ): Observable<PresignUploadResponse> {
    return this.http.post<PresignUploadResponse>(
      `${this.base}/storage/presign-upload`,
      payload,
    );
  }
}
