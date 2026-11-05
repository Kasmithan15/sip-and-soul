import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import type { SessionUser } from '../auth/auth.service.js';
import { AdminOnly, CurrentUser } from '../auth/guards.js';
import { PrismaService } from '../prisma.service.js';

class BlockDto {
  @IsBoolean({ message: 'Choose block or unblock.' })
  blocked!: boolean;
}

@Controller('admin/customers')
@AdminOnly()
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: { id: true, name: true, email: true, phone: true, role: true, blocked: true, createdAt: true, _count: { select: { orders: true } } },
    });
    return users.map(({ _count, ...u }) => ({ ...u, orders: _count.orders }));
  }

  @Patch(':id')
  async block(@CurrentUser() me: SessionUser, @Param('id', ParseUUIDPipe) id: string, @Body() input: BlockDto) {
    const user = await this.target(me, id);
    return this.prisma.user.update({ where: { id: user.id }, data: { blocked: input.blocked }, select: { id: true, blocked: true } });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() me: SessionUser, @Param('id', ParseUUIDPipe) id: string) {
    const user = await this.target(me, id);
    await this.prisma.user.delete({ where: { id: user.id } });
  }

  // Admins manage customers only; they can't block or delete themselves or other admins here.
  private async target(me: SessionUser, id: string) {
    if (id === me.id) throw new BadRequestException('You cannot change your own account here.');
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!user) throw new NotFoundException('Customer not found.');
    if (user.role === 'admin') throw new BadRequestException('Admin accounts cannot be blocked or deleted here.');
    return user;
  }
}
