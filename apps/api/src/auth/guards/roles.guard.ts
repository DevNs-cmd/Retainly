import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_ROLES, PUBLIC_ROUTE, INVITATION_ROUTE, ONBOARDING_ROUTE } from '../auth.decorators';
import { AuthUser, Role } from '../auth.types';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride(PUBLIC_ROUTE, targets)) return true;
    const isInvitation = this.reflector.getAllAndOverride<boolean>(INVITATION_ROUTE, targets) === true;
    const isOnboarding = this.reflector.getAllAndOverride<boolean>(ONBOARDING_ROUTE, targets) === true;
    if (isInvitation) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    if (!user?.organizationId) {
      if (isOnboarding) return true;
      throw new ForbiddenException('Organization membership required');
    }
    if (request.params.orgId && request.params.orgId !== user.organizationId) throw new ForbiddenException('Organization mismatch');
    const roles = this.reflector.getAllAndOverride<Role[]>(REQUIRED_ROLES, targets);
    if (roles && !roles.includes(user.role)) throw new ForbiddenException('Insufficient role');
    return true;
  }
}
