import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    category: { findUnique: jest.Mock };
    orderItem: { count: jest.Mock };
  };

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      category: { findUnique: jest.fn() },
      orderItem: { count: jest.fn() },
    };
    service = new ProductsService(prisma as unknown as PrismaService);
  });

  it('should return paginated product list with metadata', async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 'p-1', name: 'Food' }]);
    prisma.product.count.mockResolvedValue(25);

    const query = Object.assign(new QueryProductsDto(), { page: 2, limit: 10 });
    const result = await service.findAll(query);

    expect(result.items).toHaveLength(1);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('should throw NotFoundException if category does not exist on create', async () => {
    prisma.category.findUnique.mockResolvedValue(null);
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'Dog Toy',
        price: 50000,
        categoryId: '11111111-1111-1111-1111-111111111111',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should soft-deactivate product instead of deleting when referenced by orders', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'p-1' });
    prisma.orderItem.count.mockResolvedValue(2);
    prisma.product.update.mockResolvedValue({ id: 'p-1', isActive: false });

    const result = await service.remove('p-1');

    expect(result).toEqual({ deleted: false, deactivated: true });
    expect(prisma.product.delete).not.toHaveBeenCalled();
  });
});
