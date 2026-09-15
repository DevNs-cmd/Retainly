import { Body, Controller, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators';
import { Role } from '../auth/auth.types';
import { ResourceQueryDto } from '../common/dto/resource-query.dto';
import { CoachTasksService } from './coach-tasks.service';
import { CreateCoachTaskDto, UpdateCoachTaskDto } from './dto/create-coachTask.dto';
@ApiTags('coach-tasks') @ApiBearerAuth() @Controller('coach-tasks')
export class CoachTasksController {
 constructor(private readonly service: CoachTasksService) {}
 @Get() @ApiOperation({ summary: 'List coach-tasks' }) @ApiResponse({ status: 200, description: 'Paginated records' })
 list(@Query() query: ResourceQueryDto) { return this.service.list(query); }
 @Get(':id') @ApiOperation({ summary: 'Get CoachTask' }) @ApiResponse({ status: 200, description: 'Tenant record' })
 get(@Param('id') id: string) { return this.service.get(id); }
 @Post() @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Create CoachTask' }) @ApiResponse({ status: 201, description: 'Created' })
 create(@Body() dto: CreateCoachTaskDto) { return this.service.create(dto); }
 @Patch(':id') @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Update CoachTask' }) @ApiResponse({ status: 200, description: 'Updated' })
 update(@Param('id') id: string, @Body() dto: UpdateCoachTaskDto) { return this.service.update(id, dto); }
 @Delete(':id') @Roles(Role.OWNER, Role.ADMIN) @ApiOperation({ summary: 'Remove CoachTask' }) @ApiResponse({ status: 200, description: 'Removed' })
 remove(@Param('id') id: string) { return this.service.remove(id); }
}

