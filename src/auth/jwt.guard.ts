import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import { SKIP_JWT_KEY } from './skip-jwt.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (this.hasAnyDeactivator(context)) {
      return true;
    }

    return super.canActivate(context);
  }

  private hasAnyDeactivator(context: ExecutionContext): boolean {
    const keys = [IS_PUBLIC_KEY, SKIP_JWT_KEY];
    return keys.some((key) =>
      this.reflector.getAllAndOverride<boolean>(key, [context.getHandler(), context.getClass()])
    );
  }
}
