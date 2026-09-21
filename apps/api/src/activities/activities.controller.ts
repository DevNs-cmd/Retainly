import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators';
import { Role } from '../auth/auth.types';
import { ActivitiesService } from './activities.service';
import { BatchActivityDto, CreateActivityDto } from './dto/create-activity.dto';
import { ListActivitiesDto } from './dto/list-activities.dto';
@ApiTags('activities') @ApiBearerAuth() @Controller('activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}
  @Get() @ApiOperation({ summary: 'List tenant activities' }) @ApiResponse({ status: 200, description: 'Paginated activity feed' })
  list(@Query() query: ListActivitiesDto) { return this.service.list(query); }
  @Post() @Roles(Role.OWNER, Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'Record an activity and its outbox events atomically' }) @ApiResponse({ status: 201, description: 'Activity recorded' })
  create(@Body() dto: CreateActivityDto) { return this.service.create(dto); }
  @Post('batch') @Roles(Role.OWNER, Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'Record up to 100 activities in one transaction' }) @ApiResponse({ status: 201, description: 'Activities recorded' })
  batch(@Body() dto: BatchActivityDto) { return this.service.batch(dto.events); }
}
