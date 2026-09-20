import { Body, Controller, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators';
import { Role } from '../auth/auth.types';
import { ResourceQueryDto } from '../common/dto/resource-query.dto';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/create-subscription.dto';
@ApiTags('subscriptions') @ApiBearerAuth() @Controller('subscriptions')
export class SubscriptionsController {
 constructor(private readonly service: SubscriptionsService) {}
 @Get() @ApiOperation({ summary: 'List subscriptions' }) @ApiResponse({ status: 200, description: 'Paginated records' })
 list(@Query() query: ResourceQueryDto) { return this.service.list(query); }
 @Get(':id') @ApiOperation({ summary: 'Get Subscription' }) @ApiResponse({ status: 200, description: 'Tenant record' })
 get(@Param('id') id: string) { return this.service.get(id); }
 @Post() @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Create Subscription' }) @ApiResponse({ status: 201, description: 'Created' })
 create(@Body() dto: CreateSubscriptionDto) { return this.service.create(dto); }
 @Patch(':id') @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Update Subscription' }) @ApiResponse({ status: 200, description: 'Updated' })
 update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) { return this.service.update(id, dto); }
 @Delete(':id') @Roles(Role.OWNER, Role.ADMIN) @ApiOperation({ summary: 'Remove Subscription' }) @ApiResponse({ status: 200, description: 'Removed' })
 remove(@Param('id') id: string) { return this.service.remove(id); }
}

