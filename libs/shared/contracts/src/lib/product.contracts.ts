export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  images: string[];
  isActive: boolean;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
  categoryId: string;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
  categoryId?: string;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}
