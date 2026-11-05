import { Injectable, NotFoundException } from '@nestjs/common';
import type { Product } from '@prisma/client';
import { PrismaService } from '../prisma.service.js';
import type { ProductDto } from './menu.dto.js';

export const toProduct = (p: Product) => ({ ...p, price: Number(p.price) });

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async list(includeHidden: boolean) {
    const rows = await this.prisma.product.findMany({
      where: includeHidden ? {} : { available: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(toProduct);
  }

  async create(input: ProductDto) {
    return toProduct(await this.prisma.product.create({ data: input }));
  }

  async update(id: string, input: ProductDto) {
    await this.ensure(id);
    return toProduct(await this.prisma.product.update({ where: { id }, data: input }));
  }

  async remove(id: string) {
    await this.ensure(id);
    await this.prisma.product.delete({ where: { id } });
  }

  private async ensure(id: string) {
    if (!(await this.prisma.product.findUnique({ where: { id }, select: { id: true } }))) {
      throw new NotFoundException('That drink no longer exists.');
    }
  }
}
