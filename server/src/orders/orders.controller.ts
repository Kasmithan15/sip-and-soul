import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { SessionUser } from '../auth/auth.service.js';
import { AdminOnly, CurrentUser, SignedIn } from '../auth/guards.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto.js';
import { OrdersService } from './orders.service.js';

@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('orders')
  @SignedIn()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  create(@CurrentUser() user: SessionUser, @Body() input: CreateOrderDto) {
    return this.orders.create(user.id, input);
  }

  @Get('orders/mine')
  @SignedIn()
  mine(@CurrentUser() user: SessionUser) {
    return this.orders.mine(user.id);
  }

  @Post('orders/:id/cancel')
  @SignedIn()
  cancel(@CurrentUser() user: SessionUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.orders.cancelOwn(user.id, id);
  }

  @Get('admin/orders')
  @AdminOnly()
  all(@Query('status') status?: string) {
    return this.orders.all(status);
  }

  @Patch('admin/orders/:id')
  @AdminOnly()
  setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateOrderStatusDto) {
    return this.orders.setStatus(id, input);
  }

  @Get('admin/stats')
  @AdminOnly()
  stats() {
    return this.orders.stats();
  }
}
