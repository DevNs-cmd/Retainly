import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
import { PUBLIC_ROUTE } from '../auth.decorators';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest();
    const match = /^Bearer ([^\s]+)$/i.exec(request.headers.authorization || '');
    if (!match) throw new UnauthorizedException('Bearer token required');
    request.user = await this.auth.authenticate(match[1],this.reflector.getAllAndOverride<boolean>('auth:invitation',[context.getHandler(),context.getClass()])===true);
    return true;
  }
}
