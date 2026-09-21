import { Body, Controller, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common'; import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators'; import { Role } from '../auth/auth.types'; import { ResourceQueryDto } from '../common/dto/resource-query.dto'; import { MembershipsService } from './memberships.service'; import { InviteMemberDto, UpdateMemberDto } from './dto/membership.dto';
@ApiTags('memberships') @ApiBearerAuth() @Roles(Role.OWNER, Role.ADMIN) @Controller(['memberships', 'organizations/:orgId/users'])
export class MembershipsController {
 constructor(private readonly service: MembershipsService) {}
 @Get() @ApiOperation({ summary: 'List organization members' }) @ApiResponse({ status: 200 }) list(@Query() q: ResourceQueryDto) { return this.service.list(q); }
 @Get(':id') @ApiOperation({ summary: 'Get membership' }) @ApiResponse({ status: 200 }) get(@Param('id') id: string) { return this.service.get(id); }
 @Post() @ApiOperation({ summary: 'Create pending team invitation' }) @ApiResponse({ status: 201 }) create(@Body() dto: InviteMemberDto) { return this.service.invite(dto); }
 @Patch(':id') @ApiOperation({ summary: 'Change member role' }) @ApiResponse({ status: 200 }) update(@Param('id') id: string, @Body() dto: UpdateMemberDto) { return this.service.update(id, dto); }
 @Delete(':id') @ApiOperation({ summary: 'Remove member preserving an owner' }) @ApiResponse({ status: 200 }) remove(@Param('id') id: string) { return this.service.remove(id); }
}

