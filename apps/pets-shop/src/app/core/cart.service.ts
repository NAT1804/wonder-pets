import { computed, Injectable, signal } from '@angular/core';
import type { ProductDto } from '@wonder-pets/contracts';

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

const STORAGE_KEY = 'wonder_pets_cart_v1';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _items = signal<CartItem[]>(this.loadFromStorage());

  readonly items = this._items.asReadonly();
  readonly totalCount = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0),
  );
  readonly totalAmount = computed(() =>
    this._items().reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    ),
  );

  addItem(product: ProductDto, quantity = 1): void {
    if (quantity <= 0 || product.stock <= 0) {
      return;
    }

    const current = this._items();
    const existingIndex = current.findIndex(
      (item) => item.product.id === product.id,
    );

    let next: CartItem[];
    if (existingIndex >= 0) {
      next = current.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              product,
              quantity: Math.min(product.stock, item.quantity + quantity),
            }
          : item,
      );
    } else {
      next = [
        ...current,
        { product, quantity: Math.min(product.stock, quantity) },
      ];
    }

    this.commit(next);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const next = this._items().map((item) =>
      item.product.id === productId
        ? { ...item, quantity: Math.min(item.product.stock, quantity) }
        : item,
    );
    this.commit(next);
  }

  removeItem(productId: string): void {
    const next = this._items().filter((item) => item.product.id !== productId);
    this.commit(next);
  }

  clear(): void {
    this.commit([]);
  }

  private commit(items: CartItem[]): void {
    this._items.set(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota or SSR errors
    }
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
