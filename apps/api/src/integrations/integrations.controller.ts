import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common'; import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; import { Roles } from '../auth/auth.decorators'; import { Role } from '../auth/auth.types'; import { IntegrationsService } from './integrations.service'; import { ConnectIntegrationDto } from './dto/integration.dto';
@ApiTags('integrations') @ApiBearerAuth() @Roles(Role.OWNER, Role.ADMIN) @Controller('integrations') export class IntegrationsController {
 constructor(private readonly service: IntegrationsService) {}
 @Get() @ApiOperation({ summary: 'List connections without secrets' }) @ApiResponse({ status: 200 }) list() { return this.service.list(); }
 @Get(':provider') @ApiOperation({ summary: 'Connection status' }) @ApiResponse({ status: 200 }) get(@Param('provider') p: string) { return this.service.get(p); }
 @Post(':provider/connect') @ApiOperation({ summary: 'Connect API credentials or complete OAuth' }) @ApiResponse({ status: 201 }) connect(@Param('provider') p: string, @Body() dto: ConnectIntegrationDto) { return this.service.connect(p, dto); }
 @Delete(':provider/disconnect') @ApiOperation({ summary: 'Disconnect provider' }) @ApiResponse({ status: 200 }) disconnect(@Param('provider') p: string) { return this.service.disconnect(p); }
 @Post(':provider/sync') @ApiOperation({ summary: 'Queue provider synchronization' }) @ApiResponse({ status: 201 }) sync(@Param('provider') p: string) { return this.service.sync(p); }
}

