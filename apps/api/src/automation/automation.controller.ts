import { Body,Controller,Get,Post,Patch,Delete,Param,Query } from '@nestjs/common';import { ApiTags,ApiBearerAuth,ApiOperation,ApiResponse } from '@nestjs/swagger';import { Roles } from '../auth/auth.decorators';import { Role } from '../auth/auth.types';import { Plan } from '../common/guards/plan.guard';import { ResourceQueryDto } from '../common/dto/resource-query.dto';import { AutomationService } from './automation.service';import { CreateAutomationDto,UpdateAutomationDto } from './dto/automation.dto';
@ApiTags('automations') @ApiBearerAuth() @Roles(Role.OWNER,Role.ADMIN) @Plan('automation') @Controller('automations')export class AutomationController{
 constructor(private readonly service:AutomationService){}
 @Get() @ApiOperation({summary:'List automation rules'}) @ApiResponse({status:200}) list(@Query()q:ResourceQueryDto){return this.service.list(q);}
 @Get(':id') @ApiOperation({summary:'Get automation'}) @ApiResponse({status:200}) get(@Param('id')id:string){return this.service.get(id);}
 @Post() @ApiOperation({summary:'Create automation'}) @ApiResponse({status:201}) create(@Body()dto:CreateAutomationDto){return this.service.create(dto);}
 @Patch(':id') @ApiOperation({summary:'Update or enable automation'}) @ApiResponse({status:200}) update(@Param('id')id:string,@Body()dto:UpdateAutomationDto){return this.service.update(id,dto);}
 @Delete(':id') @ApiOperation({summary:'Delete automation'}) @ApiResponse({status:200}) remove(@Param('id')id:string){return this.service.remove(id);}
}

