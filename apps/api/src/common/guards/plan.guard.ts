import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; import { BillingService } from '../../billing/billing.service';
export const Plan = (feature: string) => applyDecorators(SetMetadata('plan:feature', feature), UseGuards(PlanGuard));
@Injectable() export class PlanGuard implements CanActivate {
 constructor(private readonly reflector: Reflector, private readonly billing: BillingService) {}
 async canActivate(context: ExecutionContext) {
   const feature = this.reflector.getAllAndOverride<string>('plan:feature', [context.getHandler(), context.getClass()]);
   if (!feature) return true;
   if (!await this.billing.checkFeatureAccess(context.switchToHttp().getRequest().user.organizationId, feature)) throw new ForbiddenException('Plan upgrade required');
   return true;
 }
}

