import { Controller,Get,Query } from '@nestjs/common';import { ApiTags,ApiBearerAuth,ApiOperation,ApiResponse } from '@nestjs/swagger';import { CurrentUser,Roles } from '../auth/auth.decorators';import { AuthUser,Role } from '../auth/auth.types';import { ResourceQueryDto } from '../common/dto/resource-query.dto';import { AuditService } from './audit.service';
@ApiTags('audit') @ApiBearerAuth() @Roles(Role.OWNER,Role.ADMIN) @Controller('audit-logs') export class AuditController {
 constructor(private readonly service:AuditService){}
 @Get() @ApiOperation({summary:'Inspect organization audit log'}) @ApiResponse({status:200}) list(@CurrentUser() u:AuthUser,@Query() q:ResourceQueryDto){return this.service.list(u.organizationId,q);}
}

