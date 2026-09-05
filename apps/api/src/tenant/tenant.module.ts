import { Module } from '@nestjs/common';
import { OrganizationResolver } from './organization.resolver';
import { TenantGuard } from './tenant.guard';
@Module({ providers: [OrganizationResolver, TenantGuard], exports: [OrganizationResolver, TenantGuard] })
export class TenantModule {}
