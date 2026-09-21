import { Body, Controller, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators';
import { Role } from '../auth/auth.types';
import { ResourceQueryDto } from '../common/dto/resource-query.dto';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';
@ApiTags('courses') @ApiBearerAuth() @Controller('courses')
export class CoursesController {
 constructor(private readonly service: CoursesService) {}
 @Get() @ApiOperation({ summary: 'List courses' }) @ApiResponse({ status: 200, description: 'Paginated records' })
 list(@Query() query: ResourceQueryDto) { return this.service.list(query); }
 @Get(':id') @ApiOperation({ summary: 'Get Course' }) @ApiResponse({ status: 200, description: 'Tenant record' })
 get(@Param('id') id: string) { return this.service.get(id); }
 @Post() @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Create Course' }) @ApiResponse({ status: 201, description: 'Created' })
 create(@Body() dto: CreateCourseDto) { return this.service.create(dto); }
 @Patch(':id') @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Update Course' }) @ApiResponse({ status: 200, description: 'Updated' })
 update(@Param('id') id: string, @Body() dto: UpdateCourseDto) { return this.service.update(id, dto); }
 @Delete(':id') @Roles(Role.OWNER, Role.ADMIN) @ApiOperation({ summary: 'Remove Course' }) @ApiResponse({ status: 200, description: 'Removed' })
 remove(@Param('id') id: string) { return this.service.remove(id); }
}

