export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItemDto {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

export interface OrderDto {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  shippingAddress: string;
  phone: string;
  note: string | null;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  phone: string;
  note?: string;
  items: CreateOrderItemRequest[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
