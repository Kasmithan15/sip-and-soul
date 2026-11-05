import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Patch, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { sniffImage } from '../images/sniff.js';
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

  /** Profile photo for the signed-in customer or admin: a real JPG, PNG or WebP of 2 MB or less. */
  @Post('me/avatar')
  @SignedIn()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024, files: 1 } }))
  async avatar(@CurrentUser() user: SessionUser, @UploadedFile() file?: { buffer: Buffer }) {
    if (!file) throw new BadRequestException('Choose a photo (JPG, PNG or WebP, up to 2 MB).');
    const mimeType = sniffImage(file.buffer);
    if (!mimeType) throw new BadRequestException('Only JPG, PNG or WebP photos can be used.');
    return this.auth.setAvatar(user.id, file.buffer, mimeType);
  }

  @Delete('me/avatar')
  @SignedIn()
  removeAvatar(@CurrentUser() user: SessionUser) {
    return this.auth.removeAvatar(user.id);
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
