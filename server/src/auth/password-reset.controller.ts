import { Body, Controller, Delete, Get, Headers, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto, ResetPasswordDto } from './auth.dto.js';
import { AdminOnly } from './guards.js';
import { emailConfigured, PasswordResetService } from './password-reset.service.js';

// OriginGuard has already checked that every POST comes from one of the site's own addresses.
const siteOrigin = (origin?: string) => origin ?? 'http://127.0.0.1:5180';

@Controller()
export class PasswordResetController {
  constructor(private readonly resets: PasswordResetService) {}

  @Post('auth/forgot-password')
  @HttpCode(202)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async forgot(@Body() input: ForgotPasswordDto, @Headers('origin') origin?: string) {
    await this.resets.request(input.email, siteOrigin(origin));
    return { emailed: emailConfigured() };
  }

  @Post('auth/reset-password')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async reset(@Body() input: ResetPasswordDto) {
    await this.resets.reset(input.token, input.password);
  }

  @Get('admin/password-resets')
  @AdminOnly()
  pending() {
    return this.resets.pending();
  }

  @Post('admin/password-resets/customers/:userId/link')
  @AdminOnly()
  link(@Param('userId', ParseUUIDPipe) userId: string, @Headers('origin') origin?: string) {
    return this.resets.createLink(userId, siteOrigin(origin));
  }

  @Delete('admin/password-resets/:id')
  @HttpCode(204)
  @AdminOnly()
  dismiss(@Param('id', ParseUUIDPipe) id: string) {
    return this.resets.dismiss(id);
  }
}
