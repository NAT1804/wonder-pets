import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const ORDER_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto) {
    // Merge duplicate productIds in the request payload
    const quantityByProduct = new Map<string, number>();
    for (const item of dto.items) {
      quantityByProduct.set(
        item.productId,
        (quantityByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const productIds = Array.from(quantityByProduct.keys());

    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products do not exist');
      }

      let totalAmount = new Prisma.Decimal(0);
      const orderItemsData: Array<{
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
      }> = [];

      for (const product of products) {
        const requestedQty = quantityByProduct.get(product.id) ?? 0;

        if (!product.isActive) {
          throw new BadRequestException(
            `Product "${product.name}" is no longer available`,
          );
        }

        if (product.stock < requestedQty) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}" (available: ${product.stock})`,
          );
        }

        // Atomic conditional stock decrement prevents overselling under concurrency
        const updated = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: requestedQty } },
          data: { stock: { decrement: requestedQty } },
        });

        if (updated.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}"`,
          );
        }

        const unitPrice = new Prisma.Decimal(product.price);
        totalAmount = totalAmount.plus(unitPrice.mul(requestedQty));
        orderItemsData.push({
          productId: product.id,
          quantity: requestedQty,
          unitPrice,
        });
      }

      return tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
          totalAmount,
          shippingAddress: dto.shippingAddress.trim(),
          phone: dto.phone.trim(),
          note: dto.note?.trim() ?? null,
          items: {
            create: orderItemsData,
          },
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  async findMyOrders(userId: string, query: QueryOrdersDto) {
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
    };

    return this.paginateOrders(where, query);
  }

  async findAll(query: QueryOrdersDto) {
    const where: Prisma.OrderWhereInput = query.status
      ? { status: query.status }
      : {};

    return this.paginateOrders(where, query);
  }

  async findOne(id: string, currentUser: AuthenticatedUser) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) {
      throw new NotFoundException(`Order "${id}" not found`);
    }

    if (currentUser.role !== Role.ADMIN && order.userId !== currentUser.id) {
      throw new ForbiddenException('You do not have access to this order');
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException(`Order "${id}" not found`);
      }

      if (
        order.status === OrderStatus.CANCELLED &&
        dto.status !== OrderStatus.CANCELLED
      ) {
        throw new BadRequestException('Cannot reopen a cancelled order');
      }

      if (
        order.status === OrderStatus.COMPLETED &&
        dto.status !== OrderStatus.COMPLETED
      ) {
        throw new BadRequestException(
          'Cannot change status of a completed order',
        );
      }

      // Restore stock when transitioning into CANCELLED
      if (
        dto.status === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: dto.status },
        include: ORDER_INCLUDE,
      });
    });
  }

  private async paginateOrders(
    where: Prisma.OrderWhereInput,
    query: QueryOrdersDto,
  ) {
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.order.count({ where }),
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
}
