import { Controller,Get,Param,Query } from '@nestjs/common';import { ApiTags,ApiBearerAuth,ApiOperation,ApiResponse } from '@nestjs/swagger';import { CurrentUser,Roles } from '../auth/auth.decorators';import { AuthUser,Role } from '../auth/auth.types';import { DatabaseService } from '../data/database.service';import { ResourceQueryDto } from '../common/dto/resource-query.dto';import { BillingService } from '../billing/billing.service';
@ApiTags('usage') @ApiBearerAuth() @Roles(Role.OWNER,Role.ADMIN) @Controller('usage')export class UsageController{
 constructor(private readonly db:DatabaseService,private readonly billing:BillingService){}
 @Get() @ApiOperation({summary:'Current usage counters'}) @ApiResponse({status:200})get(@CurrentUser()u:AuthUser){return this.billing.usage(u.organizationId);}
 @Get(':metric') @ApiOperation({summary:'Persisted usage history'}) @ApiResponse({status:200})history(@CurrentUser()u:AuthUser,@Param('metric')metric:string,@Query()q:ResourceQueryDto){return this.db.list('usage',u.organizationId,{metric},{skip:q.skip,take:q.limit,orderBy:{periodStart:'desc'}});}
}

