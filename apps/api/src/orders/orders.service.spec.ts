import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let tx: {
    product: {
      findMany: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
    };
    order: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let prisma: {
    $transaction: jest.Mock;
    order: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(() => {
    tx = {
      product: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      order: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    prisma = {
      $transaction: jest.fn((cb) => cb(tx)),
      order: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  it('should compute totalAmount from DB prices and decrement stock atomically', async () => {
    tx.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Dog Food',
        price: new Prisma.Decimal('200000.00'),
        stock: 10,
        isActive: true,
      },
    ]);
    tx.product.updateMany.mockResolvedValue({ count: 1 });
    tx.order.create.mockImplementation(({ data }) => ({
      id: 'order-1',
      ...data,
    }));

    const result = await service.create('user-1', {
      shippingAddress: '123 Nguyen Hue, HCM',
      phone: '0901234567',
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-1', quantity: 1 },
      ],
    });

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: { id: 'prod-1', stock: { gte: 3 } },
      data: { stock: { decrement: 3 } },
    });
    expect(result.totalAmount.toString()).toBe('600000');
  });

  it('should reject order when stock is insufficient', async () => {
    tx.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Dog Food',
        price: new Prisma.Decimal('200000.00'),
        stock: 1,
        isActive: true,
      },
    ]);

    await expect(
      service.create('user-1', {
        shippingAddress: '123 Nguyen Hue, HCM',
        phone: '0901234567',
        items: [{ productId: 'prod-1', quantity: 5 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should block non-admin users from viewing another user order', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'other-user',
    });

    await expect(
      service.findOne('order-1', {
        id: 'user-1',
        email: 'a@b.com',
        fullName: 'A',
        phone: null,
        role: Role.CUSTOMER,
        emailVerified: false,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should restore stock when cancelling an order', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.PENDING,
      items: [{ productId: 'prod-1', quantity: 2 }],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CANCELLED,
    });

    await service.updateStatus('order-1', { status: OrderStatus.CANCELLED });

    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: { increment: 2 } },
    });
  });
});
