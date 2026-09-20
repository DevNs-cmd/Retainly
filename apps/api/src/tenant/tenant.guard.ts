import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TenantContext } from './tenant.context';
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenant: TenantContext) {}
  canActivate(context: ExecutionContext): boolean { return !!this.tenant.organizationId; }
}
