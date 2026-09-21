import { Body, Controller, Get, Post, Patch, Delete, Param, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators'; import { Role } from '../auth/auth.types';
import { OrganizationsService } from './organizations.service'; import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';
@ApiTags('organizations') @ApiBearerAuth() @Controller('organizations')
export class OrganizationsController {
 constructor(private readonly service: OrganizationsService) {}
 @Post() @SetMetadata('auth:onboarding', true) @Roles(Role.OWNER, Role.ADMIN)
 @ApiOperation({ summary: 'Provision organization and owner atomically' }) @ApiResponse({ status: 201, description: 'Organization and owner created' })
 create(@Body() dto: CreateOrganizationDto) { return this.service.create(dto); }
 @Get(':id') @ApiOperation({ summary: 'Organization details' }) @ApiResponse({ status: 200, description: 'Organization' })
 get(@Param('id') id: string) { return this.service.get(id); }
 @Patch(':id') @Roles(Role.OWNER, Role.ADMIN) @ApiOperation({ summary: 'Update organization settings' }) @ApiResponse({ status: 200, description: 'Updated' })
 update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) { return this.service.update(id, dto); }
 @Delete(':id') @Roles(Role.OWNER) @ApiOperation({ summary: 'Soft-delete organization' }) @ApiResponse({ status: 200, description: 'Deleted' })
 remove(@Param('id') id: string) { return this.service.remove(id); }
}

