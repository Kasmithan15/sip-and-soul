import { Body, Controller, Get, HttpCode, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto.js';
import { AuthService, type SessionUser } from './auth.service.js';
import { CurrentUser, OptionalJwtGuard, SignedIn } from './guards.js';
import { SESSION_COOKIE } from './jwt.strategy.js';

const cookie = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  async login(@Body() input: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.login(input);
    res.cookie(SESSION_COOKIE, token, cookie());
    return user;
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() input: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.auth.register(input);
    res.cookie(SESSION_COOKIE, token, cookie());
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge: _m, ...options } = cookie();
    res.clearCookie(SESSION_COOKIE, options);
  }

  /** The signed-in user, or null for visitors (no 401 noise on every page load). */
  @Get('session')
  @UseGuards(OptionalJwtGuard)
  session(@CurrentUser() user: SessionUser | null) {
    return { user };
  }

  @Get('me')
  @SignedIn()
  me(@CurrentUser() user: SessionUser) {
    return user;
  }

  @Patch('me')
  @SignedIn()
  update(@CurrentUser() user: SessionUser, @Body() input: UpdateProfileDto) {
    return this.auth.updateProfile(user.id, input);
  }

  @Post('password')
  @HttpCode(204)
  @SignedIn()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async changePassword(@CurrentUser() user: SessionUser, @Body() input: ChangePasswordDto, @Res({ passthrough: true }) res: Response) {
    const { token } = await this.auth.changePassword(user.id, input);
    res.cookie(SESSION_COOKIE, token, cookie());
  }
}
