import { Controller,Get,Query } from '@nestjs/common';import { ApiTags,ApiBearerAuth,ApiOperation,ApiResponse } from '@nestjs/swagger';import { CurrentUser } from '../auth/auth.decorators';import { AuthUser } from '../auth/auth.types';import { ResourceQueryDto } from '../common/dto/resource-query.dto';import { AnalyticsService } from './analytics.service';
@ApiTags('analytics') @ApiBearerAuth() @Controller('analytics')export class AnalyticsController{
 constructor(private readonly service:AnalyticsService){}
 @Get('overview') @ApiOperation({summary:'Organization KPIs'}) @ApiResponse({status:200}) overview(@CurrentUser()u:AuthUser,@Query()q:ResourceQueryDto){return this.service.read(u.organizationId,'overview',q);}
 @Get('cohorts') @ApiOperation({summary:'Cohort retention'}) @ApiResponse({status:200}) cohorts(@CurrentUser()u:AuthUser,@Query()q:ResourceQueryDto){return this.service.read(u.organizationId,'cohorts',q);}
 @Get('risk-trends') @ApiOperation({summary:'Historical risk distribution'}) @ApiResponse({status:200}) trends(@CurrentUser()u:AuthUser,@Query()q:ResourceQueryDto){return this.service.read(u.organizationId,'risk-trends',q);}
 @Get('campaigns') @ApiOperation({summary:'Campaign performance'}) @ApiResponse({status:200}) campaigns(@CurrentUser()u:AuthUser,@Query()q:ResourceQueryDto){return this.service.read(u.organizationId,'campaigns',q);}
 @Get('courses') @ApiOperation({summary:'Course engagement'}) @ApiResponse({status:200}) courses(@CurrentUser()u:AuthUser,@Query()q:ResourceQueryDto){return this.service.read(u.organizationId,'courses',q);}
}

