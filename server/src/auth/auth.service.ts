import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma.service.js';
import { imageIdFromUrl } from '../images/sniff.js';
import type { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './auth.dto.js';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar: string | null;
  createdAt: Date;
}

export const sessionSelect = { id: true, name: true, email: true, phone: true, role: true, avatar: true, createdAt: true } as const;

// Compared against when the email is unknown, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = '$2b$12$Wym3CNjONpyYgexJS5.YTOBV.6UeNhrhXcyv2ywn8q68hfuC9sXDO';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async login(input: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });
    const ok = await compare(input.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException('Email or password is incorrect.');
    if (user.blocked) throw new ForbiddenException('This account has been blocked. Please contact the café.');
    return { user: this.toSession(user), token: await this.token(user.id) };
  }

  async register(input: RegisterDto) {
    if (await this.prisma.user.findUnique({ where: { email: input.email }, select: { id: true } })) {
      throw new ConflictException({ message: 'An account with this email already exists.', field: 'email' });
    }
    const user = await this.prisma.user.create({
      data: { name: input.name, email: input.email, phone: input.phone, passwordHash: await hash(input.password, 12) },
    });
    return { user: this.toSession(user), token: await this.token(user.id) };
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { name: input.name, phone: input.phone } });
    return this.toSession(user);
  }

  /** Stores a new profile photo and deletes the one it replaces. */
  async setAvatar(userId: string, data: Buffer, mimeType: string) {
    const old = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { avatar: true } });
    const image = await this.prisma.image.create({ data: { mimeType, data: new Uint8Array(data) }, select: { id: true } });
    const user = await this.prisma.user.update({ where: { id: userId }, data: { avatar: `/api/images/${image.id}` } });
    await this.deleteImage(old.avatar);
    return this.toSession(user);
  }

  async removeAvatar(userId: string) {
    const old = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { avatar: true } });
    const user = await this.prisma.user.update({ where: { id: userId }, data: { avatar: null } });
    await this.deleteImage(old.avatar);
    return this.toSession(user);
  }

  private async deleteImage(url: string | null) {
    const id = imageIdFromUrl(url);
    if (id) await this.prisma.image.deleteMany({ where: { id } });
  }

  async changePassword(userId: string, input: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await compare(input.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException({ message: 'Your current password is incorrect.', field: 'currentPassword' });
    }
    // Round down to the second so the new token (iat in whole seconds) stays valid.
    const changedAt = new Date(Math.floor(Date.now() / 1000) * 1000);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hash(input.newPassword, 12), passwordChangedAt: changedAt },
    });
    return { token: await this.token(userId) };
  }

  token(userId: string) {
    return this.jwt.signAsync({ sub: userId }, { expiresIn: 7 * 24 * 60 * 60 });
  }

  private toSession(user: SessionUser & Record<string, unknown>): SessionUser {
    return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar ?? null, createdAt: user.createdAt };
  }
}
