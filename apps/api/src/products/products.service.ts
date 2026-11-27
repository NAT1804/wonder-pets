import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { isUuid, toSlug } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const PRODUCT_INCLUDE = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} as const;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const where: Prisma.ProductWhereInput = {};

    if (query.onlyActive !== false) {
      where.isActive = true;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findUnique({
      where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
      include: PRODUCT_INCLUDE,
    });

    if (!product) {
      throw new NotFoundException(`Product "${idOrSlug}" not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const slug = toSlug(dto.slug?.trim() || dto.name);
    if (!slug) {
      throw new BadRequestException('Unable to derive a valid slug');
    }

    const [category, existingSlug] = await Promise.all([
      this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true },
      }),
      this.prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      }),
    ]);

    if (!category) {
      throw new NotFoundException(`Category "${dto.categoryId}" not found`);
    }

    if (existingSlug) {
      throw new ConflictException(`Product slug "${slug}" already exists`);
    }

    return this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() ?? null,
        price: dto.price,
        stock: dto.stock ?? 0,
        images: dto.images ?? [],
        isActive: dto.isActive ?? true,
        categoryId: dto.categoryId,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product "${id}" not found`);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException(`Category "${dto.categoryId}" not found`);
      }
    }

    const nextSlug = dto.slug ? toSlug(dto.slug) : undefined;
    if (nextSlug && nextSlug !== existing.slug) {
      const conflict = await this.prisma.product.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException(`Product slug "${nextSlug}" already exists`);
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
        ...(dto.images !== undefined ? { images: dto.images } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Product "${id}" not found`);
    }

    // Soft-deactivate if referenced by existing orders; otherwise delete cleanly
    const orderItemCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return { deleted: false, deactivated: true };
    }

    await this.prisma.product.delete({ where: { id } });
    return { deleted: true, deactivated: false };
  }
}
