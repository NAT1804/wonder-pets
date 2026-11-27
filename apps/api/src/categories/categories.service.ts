import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUuid, toSlug } from '../common/utils/slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(idOrSlug: string) {
    const category = await this.prisma.category.findUnique({
      where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category "${idOrSlug}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = toSlug(dto.slug?.trim() || dto.name);
    if (!slug) {
      throw new BadRequestException('Unable to derive a valid slug');
    }

    const existing = await this.prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`Category slug "${slug}" already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundException(`Category "${id}" not found`);
    }

    const nextSlug = dto.slug ? toSlug(dto.slug) : undefined;
    if (nextSlug && nextSlug !== existing.slug) {
      const conflict = await this.prisma.category.findUnique({
        where: { slug: nextSlug },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException(
          `Category slug "${nextSlug}" already exists`,
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() || null }
          : {}),
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw new NotFoundException(`Category "${id}" not found`);
    }

    if (category._count.products > 0) {
      throw new ConflictException(
        'Cannot delete category while products are still assigned to it',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }
}
