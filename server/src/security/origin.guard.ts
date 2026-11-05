import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

// FRONTEND_ORIGINS plus the public URL Railway assigns to the service.
export const allowedOrigins = () =>
  [
    ...(process.env.FRONTEND_ORIGINS ?? 'http://localhost:5180').split(','),
    process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '',
  ]
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

/** Blocks state-changing requests from other websites (CSRF protection for the session cookie). */
@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;
    const origin = request.get('origin');
    if (!origin || !allowedOrigins().includes(origin)) {
      throw new ForbiddenException('Request origin is not allowed.');
    }
    return true;
  }
}
