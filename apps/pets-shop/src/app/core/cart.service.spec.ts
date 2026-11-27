import { TestBed } from '@angular/core/testing';
import type { ProductDto } from '@wonder-pets/contracts';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: ProductDto = {
    id: 'prod-1',
    name: 'Royal Canin 4kg',
    slug: 'royal-canin-4kg',
    description: 'Dog food',
    price: '650000.00',
    stock: 3,
    images: [],
    isActive: true,
    categoryId: 'cat-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should add items, clamp to stock, and calculate totalAmount', () => {
    service.addItem(mockProduct, 2);
    expect(service.totalCount()).toBe(2);
    expect(service.totalAmount()).toBe(1300000);

    service.addItem(mockProduct, 5);
    expect(service.totalCount()).toBe(3);
    expect(service.totalAmount()).toBe(1950000);
  });

  it('should remove item when quantity drops to 0 and support clear()', () => {
    service.addItem(mockProduct, 1);
    service.updateQuantity('prod-1', 0);
    expect(service.items()).toHaveLength(0);

    service.addItem(mockProduct, 2);
    service.clear();
    expect(service.totalCount()).toBe(0);
  });
});
