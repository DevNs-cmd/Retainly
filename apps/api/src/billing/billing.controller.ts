import { Controller, Get, Post, Body } from '@nestjs/common'; import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; import { CurrentUser, Roles } from '../auth/auth.decorators'; import { AuthUser, Role } from '../auth/auth.types'; import { BillingService } from './billing.service'; import { CheckoutDto } from './dto/billing.dto';
@ApiTags('billing') @ApiBearerAuth() @Roles(Role.OWNER,Role.ADMIN) @Controller('billing') export class BillingController {
 constructor(private readonly service: BillingService) {}
 @Get('subscription') @ApiOperation({ summary:'Current subscription and limits' }) @ApiResponse({status:200}) subscription(@CurrentUser() u:AuthUser){return this.service.subscription(u.organizationId);}
 @Get('usage') @ApiOperation({ summary:'Current period usage' }) @ApiResponse({status:200}) usage(@CurrentUser() u:AuthUser){return this.service.usage(u.organizationId);}
 @Get('invoices') @ApiOperation({ summary:'Stripe invoices' }) @ApiResponse({status:200}) invoices(@CurrentUser() u:AuthUser){return this.service.invoices(u.organizationId);}
 @Post('checkout') @Roles(Role.OWNER) @ApiOperation({ summary:'Create plan checkout' }) @ApiResponse({status:201}) checkout(@CurrentUser() u:AuthUser,@Body() dto:CheckoutDto){return this.service.checkout(u.organizationId,dto.planTier,dto.requestId);}
 @Post('portal') @Roles(Role.OWNER) @ApiOperation({ summary:'Create billing portal session' }) @ApiResponse({status:201}) portal(@CurrentUser() u:AuthUser){return this.service.portal(u.organizationId);}
}

