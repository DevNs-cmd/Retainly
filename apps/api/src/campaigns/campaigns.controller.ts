import { ScheduleCampaignDto } from './dto/schedule-campaign.dto';
import { Body, Controller, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/auth.decorators';
import { Role } from '../auth/auth.types';
import { ResourceQueryDto } from '../common/dto/resource-query.dto';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/create-campaign.dto';
@ApiTags('campaigns') @ApiBearerAuth() @Controller('campaigns')
export class CampaignsController {
 constructor(private readonly service: CampaignsService) {}
 @Get() @ApiOperation({ summary: 'List campaigns' }) @ApiResponse({ status: 200, description: 'Paginated records' })
 list(@Query() query: ResourceQueryDto) { return this.service.list(query); }
 @Post(':id/send') @Roles(Role.OWNER,Role.ADMIN) @ApiOperation({summary:'Send campaign now'}) @ApiResponse({status:201}) send(@Param('id') id:string){return this.service.schedule(id);}
 @Post(':id/schedule') @Roles(Role.OWNER,Role.ADMIN) @ApiOperation({summary:'Schedule campaign'}) @ApiResponse({status:201}) schedule(@Param('id') id:string,@Body() dto:ScheduleCampaignDto){return this.service.schedule(id,dto);}
 @Get(':id') @ApiOperation({ summary: 'Get Campaign' }) @ApiResponse({ status: 200, description: 'Tenant record' })
 get(@Param('id') id: string) { return this.service.get(id); }
 @Post() @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Create Campaign' }) @ApiResponse({ status: 201, description: 'Created' })
 create(@Body() dto: CreateCampaignDto) { return this.service.create(dto); }
 @Patch(':id') @Roles(Role.OWNER, Role.ADMIN, Role.COACH) @ApiOperation({ summary: 'Update Campaign' }) @ApiResponse({ status: 200, description: 'Updated' })
 update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) { return this.service.update(id, dto); }
 @Delete(':id') @Roles(Role.OWNER, Role.ADMIN) @ApiOperation({ summary: 'Remove Campaign' }) @ApiResponse({ status: 200, description: 'Removed' })
 remove(@Param('id') id: string) { return this.service.remove(id); }
}


