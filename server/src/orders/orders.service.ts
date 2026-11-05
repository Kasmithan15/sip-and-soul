import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, type Order } from '@prisma/client';
import { PrismaService } from '../prisma.service.js';
import { ORDER_STATUSES, type CreateOrderDto, type UpdateOrderStatusDto } from './orders.dto.js';

interface OrderItem { productId: string; name: string; price: number; quantity: number }

const toOrder = (o: Order & { user?: { name: string; email: string } }) => ({ ...o, total: Number(o.total), items: o.items as unknown as OrderItem[] });

// Which status an order may move to next; completed and cancelled are final.
const NEXT: Record<string, string[]> = {
  pending: ['preparing', 'ready', 'completed', 'cancelled'],
  preparing: ['ready', 'completed', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateOrderDto) {
    // Merge repeated lines of the same drink, then price everything from the database, never from the browser.
    const qty = new Map<string, number>();
    for (const item of input.items) qty.set(item.productId, (qty.get(item.productId) ?? 0) + item.quantity);
    if ([...qty.values()].some((q) => q > 20)) throw new BadRequestException('You can order up to 20 of one drink.');

    const products = await this.prisma.product.findMany({ where: { id: { in: [...qty.keys()] } } });
    const items: OrderItem[] = [...qty].map(([productId, quantity]) => {
      const p = products.find((x) => x.id === productId);
      if (!p) throw new BadRequestException('A drink in your cart is no longer on the menu. Please remove it and try again.');
      if (!p.available) throw new BadRequestException(`${p.name} is not available right now. Please remove it and try again.`);
      return { productId, name: p.name, price: Number(p.price), quantity };
    });
    const total = items.reduce((sum, i) => sum.add(new Prisma.Decimal(i.price).mul(i.quantity)), new Prisma.Decimal(0));

    const order = await this.prisma.order.create({
      data: {
        userId,
        items: items as unknown as Prisma.InputJsonValue,
        total,
        type: input.type,
        phone: input.phone,
        address: input.type === 'delivery' ? input.address : '',
        note: input.note ?? '',
      },
    });
    return toOrder(order);
  }

  async mine(userId: string) {
    const rows = await this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    return rows.map(toOrder);
  }

  async cancelOwn(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== userId) throw new NotFoundException('Order not found.');
    if (order.status !== 'pending') throw new ForbiddenException('This order is already being prepared and can no longer be cancelled.');
    return toOrder(await this.prisma.order.update({ where: { id }, data: { status: 'cancelled' } }));
  }

  async all(status?: string) {
    const rows = await this.prisma.order.findMany({
      where: (ORDER_STATUSES as readonly string[]).includes(status ?? '') ? { status: status as Order['status'] } : {},
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    });
    return rows.map(toOrder);
  }

  async setStatus(id: string, input: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found.');
    if (order.status !== input.status && !NEXT[order.status].includes(input.status)) {
      throw new BadRequestException(`A ${order.status} order cannot be changed to ${input.status}.`);
    }
    const updated = await this.prisma.order.update({ where: { id }, data: { status: input.status }, include: { user: { select: { name: true, email: true } } } });
    return toOrder(updated);
  }

  async stats() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [today, open, revenue, customers, products] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      this.prisma.order.count({ where: { status: { in: ['pending', 'preparing', 'ready'] } } }),
      this.prisma.order.aggregate({ _sum: { total: true }, where: { status: 'completed' } }),
      this.prisma.user.count({ where: { role: 'customer' } }),
      this.prisma.product.count({ where: { available: true } }),
    ]);
    return { ordersToday: today, openOrders: open, revenue: Number(revenue._sum.total ?? 0), customers, products };
  }
}
