import { Controller,Get,Post,Param,Query } from '@nestjs/common';import { ApiTags,ApiBearerAuth,ApiOperation,ApiResponse } from '@nestjs/swagger';import { Roles } from '../../auth/auth.decorators';import { Role } from '../../auth/auth.types';import { ResourceQueryDto } from '../../common/dto/resource-query.dto';import { RiskService } from '../services/risk.service';
@ApiTags('risk') @ApiBearerAuth() @Controller('risk/scores')export class RiskController{
 constructor(private readonly service:RiskService){}
 @Get() @ApiOperation({summary:'Latest risk snapshots'}) @ApiResponse({status:200}) list(@Query()q:ResourceQueryDto){return this.service.list(q);}
 @Get(':studentId/history') @ApiOperation({summary:'Risk history'}) @ApiResponse({status:200}) history(@Param('studentId')id:string,@Query()q:ResourceQueryDto){return this.service.history(id,q);}
 @Get(':studentId') @ApiOperation({summary:'Student risk snapshot'}) @ApiResponse({status:200}) latest(@Param('studentId')id:string){return this.service.latest(id);}
 @Post('recalculate/:studentId') @Roles(Role.OWNER,Role.ADMIN,Role.COACH) @ApiOperation({summary:'Queue risk recalculation'}) @ApiResponse({status:201}) recalculate(@Param('studentId')id:string){return this.service.recalculate(id);}
}

