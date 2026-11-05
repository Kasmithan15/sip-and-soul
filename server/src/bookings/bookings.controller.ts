import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminOnly } from '../auth/guards.js';
import { PrismaService } from '../prisma.service.js';
import { ReservationDto, ReservationStatusDto, SubscribeDto } from './bookings.dto.js';

const OPEN = '07:00';
const CLOSE = '22:00';
const MAX_DAYS_AHEAD = 60;

@Controller()
export class BookingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('reservations')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async reserve(@Body() input: ReservationDto) {
    const date = new Date(`${input.date}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) throw new BadRequestException({ message: 'Choose a valid date.', fields: { date: 'Choose a valid date.' } });
    // Compare calendar days in Sri Lanka time (UTC+5:30), where the café is.
    const today = new Date(new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10) + 'T00:00:00Z');
    const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);
    if (days < 0) throw new BadRequestException({ message: 'Choose today or a later date.', fields: { date: 'Choose today or a later date.' } });
    if (days > MAX_DAYS_AHEAD) throw new BadRequestException({ message: `Reservations open up to ${MAX_DAYS_AHEAD} days ahead.`, fields: { date: `Choose a date within the next ${MAX_DAYS_AHEAD} days.` } });
    if (input.time < OPEN || input.time > CLOSE) throw new BadRequestException({ message: `We take reservations from ${OPEN} to ${CLOSE}.`, fields: { time: `Choose a time between ${OPEN} and ${CLOSE}.` } });

    const r = await this.prisma.reservation.create({ data: { ...input, date, note: input.note ?? '' } });
    return { id: r.id, date: input.date, time: r.time, guests: r.guests };
  }

  @Post('newsletter')
  @HttpCode(202)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async subscribe(@Body() input: SubscribeDto) {
    // Same answer for new and existing addresses, so the form can't be used to check who subscribed.
    await this.prisma.subscriber.upsert({ where: { email: input.email }, create: { email: input.email }, update: {} });
    return { ok: true };
  }

  @Get('admin/reservations')
  @AdminOnly()
  async reservations() {
    const rows = await this.prisma.reservation.findMany({ orderBy: [{ date: 'desc' }, { time: 'desc' }], take: 300 });
    return rows.map((r) => ({ ...r, date: r.date.toISOString().slice(0, 10) }));
  }

  @Patch('admin/reservations/:id')
  @AdminOnly()
  async setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() input: ReservationStatusDto) {
    if (!(await this.prisma.reservation.findUnique({ where: { id }, select: { id: true } }))) throw new NotFoundException('Reservation not found.');
    const r = await this.prisma.reservation.update({ where: { id }, data: { status: input.status } });
    return { ...r, date: r.date.toISOString().slice(0, 10) };
  }

  @Get('admin/subscribers')
  @AdminOnly()
  subscribers() {
    return this.prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
  }

  @Delete('admin/subscribers/:id')
  @HttpCode(204)
  @AdminOnly()
  async unsubscribe(@Param('id', ParseUUIDPipe) id: string) {
    await this.prisma.subscriber.deleteMany({ where: { id } });
  }
}
