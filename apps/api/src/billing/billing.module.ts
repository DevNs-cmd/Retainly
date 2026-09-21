import { Global, Module } from '@nestjs/common'; import { BillingService } from './billing.service'; import { BillingController } from './billing.controller'; import { PlanGuard } from '../common/guards/plan.guard';
@Global() @Module({ controllers:[BillingController],providers:[BillingService,PlanGuard],exports:[BillingService,PlanGuard] }) export class BillingModule {}

