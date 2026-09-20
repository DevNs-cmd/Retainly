import { Controller, Get, Patch, Delete, Param, Query } from '@nestjs/common'; import { ApiTags,ApiBearerAuth,ApiOperation,ApiResponse } from '@nestjs/swagger'; import { CurrentUser } from '../auth/auth.decorators'; import { AuthUser } from '../auth/auth.types'; import { ResourceQueryDto } from '../common/dto/resource-query.dto'; import { NotificationService } from './notifications.service';
@ApiTags('notifications') @ApiBearerAuth() @Controller('notifications') export class NotificationsController {
 constructor(private readonly service:NotificationService){}
 @Get() @ApiOperation({summary:'Current user notifications'}) @ApiResponse({status:200}) list(@CurrentUser() u:AuthUser,@Query() q:ResourceQueryDto){return this.service.list(u.organizationId,u.userId,q);}
 @Patch(':id/read') @ApiOperation({summary:'Mark notification read'}) @ApiResponse({status:200}) read(@CurrentUser() u:AuthUser,@Param('id') id:string){return this.service.mark(u.organizationId,u.userId,id);}
 @Delete(':id') @ApiOperation({summary:'Dismiss notification'}) @ApiResponse({status:200}) dismiss(@CurrentUser() u:AuthUser,@Param('id') id:string){return this.service.mark(u.organizationId,u.userId,id,true);}
}

