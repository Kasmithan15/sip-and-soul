import { applyDecorators, createParamDecorator, ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from './admin.guard.js';
import type { SessionUser } from './auth.service.js';

/** Like SignedIn, but lets visitors through with no user instead of answering 401. */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<T>(_err: unknown, user: T) {
    return (user || null) as T;
  }
}

/** Signed-in customers or admins. */
export const SignedIn = () => UseGuards(AuthGuard('jwt'));
/** Admins only. */
export const AdminOnly = () => applyDecorators(UseGuards(AuthGuard('jwt'), AdminGuard));
/** The signed-in user from the session cookie. */
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<{ user: SessionUser }>().user);
