import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: {
    category: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new CategoriesService(prisma as unknown as PrismaService);
  });

  it('should auto-generate Vietnamese slug when creating a category', async () => {
    prisma.category.findUnique.mockResolvedValue(null);
    prisma.category.create.mockResolvedValue({
      id: 'cat-1',
      name: 'Thức ăn cho chó',
      slug: 'thuc-an-cho-cho',
      description: null,
    });

    const result = await service.create({ name: 'Thức ăn cho chó' });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'thuc-an-cho-cho',
        }),
      }),
    );
    expect(result.slug).toBe('thuc-an-cho-cho');
  });

  it('should throw ConflictException when deleting a category that still has products', async () => {
    prisma.category.findUnique.mockResolvedValue({
      id: 'cat-1',
      _count: { products: 3 },
    });

    await expect(service.remove('cat-1')).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException when category does not exist', async () => {
    prisma.category.findUnique.mockResolvedValue(null);

    await expect(service.findOne('unknown-slug')).rejects.toThrow(
      NotFoundException,
    );
  });
});
