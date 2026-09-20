import { Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../auth/auth.decorators';
import { AuthUser } from '../auth/auth.types';
import { StudentImportService } from './student-import.service';
import { Body, Controller, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators';
import { Role } from '../auth/auth.types';
import { ResourceQueryDto } from '../common/dto/resource-query.dto';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/create-student.dto';
@ApiTags('students') @ApiBearerAuth() @Controller('students')
export class StudentsController {
 constructor(private readonly imports: StudentImportService, private readonly service: StudentsService) {}
 @Get() @ApiOperation({ summary: 'List students' }) @ApiResponse({ status: 200, description: 'Paginated records' })
 list(@Query() query: ResourceQueryDto) { return this.service.list(query); }
 @Get('at-risk') @ApiOperation({summary:'High risk students'}) @ApiResponse({status:200}) atRisk(@Query() q:ResourceQueryDto){return this.service.atRisk(q);}
 @Post('import') @Roles(Role.OWNER,Role.ADMIN) @ApiOperation({summary:'Upload a raw text/csv stream to S3'}) @ApiResponse({status:201}) import(@CurrentUser() u:AuthUser,@Req() req:Request){if(!req.is('text/csv'))throw new BadRequestException('Content-Type must be text/csv');return this.imports.upload(u.organizationId,req);}
 @Get(':id') @ApiOperation({ summary: 'Get Student' }) @ApiResponse({ status: 200, description: 'Tenant record' })
 get(@Param('id') id: string) { return this.service.get(id); }
 @Post() @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Create Student' }) @ApiResponse({ status: 201, description: 'Created' })
 create(@Body() dto: CreateStudentDto) { return this.service.create(dto); }
 @Patch(':id') @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Update Student' }) @ApiResponse({ status: 200, description: 'Updated' })
 update(@Param('id') id: string, @Body() dto: UpdateStudentDto) { return this.service.update(id, dto); }
 @Delete(':id') @Roles(Role.OWNER, Role.ADMIN) @ApiOperation({ summary: 'Remove Student' }) @ApiResponse({ status: 200, description: 'Removed' })
 remove(@Param('id') id: string) { return this.service.remove(id); }
}


