import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; import { DatabaseService } from '../../data/database.service'; import { PUBLIC_ROUTE } from '../auth.decorators';
@Injectable() export class MembershipGuard implements CanActivate {
 constructor(private readonly db: DatabaseService, private readonly reflector: Reflector) {}
 async canActivate(context: ExecutionContext) {
   const targets = [context.getHandler(), context.getClass()];
   if (this.reflector.getAllAndOverride(PUBLIC_ROUTE, targets) || this.reflector.getAllAndOverride('auth:onboarding', targets)) return true;
   const request = context.switchToHttp().getRequest();
   const { userId, organizationId } = request.user;
   const organization = await this.db.require('organization', organizationId, organizationId);
   if (organization.deletedAt) throw new ForbiddenException('Organization is inactive');
   const membership = await this.db.first('membership', organizationId, { userId, deletedAt: null, invitationStatus: 'ACCEPTED' });
   if (!membership) throw new ForbiddenException('Active organization membership required');
   request.user.role = membership.role;
   return true;
 }
}

