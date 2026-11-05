import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { SessionUser } from './auth.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: SessionUser }>();
    if (request.user?.role !== 'admin') throw new ForbiddenException('Admin access is required.');
    return true;
  }
}
