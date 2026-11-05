import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service.js';
import { sessionSelect } from './auth.service.js';

export const SESSION_COOKIE = 'sipsoul_session';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: { cookies?: Record<string, string> }) => req?.cookies?.[SESSION_COOKIE] ?? null]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; iat?: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { ...sessionSelect, blocked: true, passwordChangedAt: true },
    });
    if (!user) throw new UnauthorizedException('Your session is no longer valid. Please sign in again.');
    if (user.blocked) throw new UnauthorizedException('This account has been blocked.');
    // Sessions opened before a password change stop working.
    if (user.passwordChangedAt && (payload.iat ?? 0) < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      throw new UnauthorizedException('Your password was changed. Please sign in again.');
    }
    const { blocked: _b, passwordChangedAt: _p, ...session } = user;
    return session;
  }
}
