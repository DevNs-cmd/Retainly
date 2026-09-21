import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { CurrentUser, Roles } from '../auth/auth.decorators';
import { AuthUser, Role } from '../auth/auth.types';
import { InvitationService } from './invitation.service';
class AcceptInvitationDto { @ApiProperty() @IsString() @MinLength(1) @MaxLength(4096) token!:string; }
@ApiTags('memberships') @ApiBearerAuth() @Controller('invitations')
export class InvitationsController {
 constructor(private readonly invitations:InvitationService){}
 @Post('accept') @SetMetadata('auth:onboarding',true) @SetMetadata('auth:invitation',true) @Roles(Role.OWNER,Role.ADMIN,Role.COACH,Role.VIEWER)
 @ApiOperation({summary:'Accept invitation using an authenticated verified email'})
 accept(@Body()dto:AcceptInvitationDto,@CurrentUser()user:AuthUser){return this.invitations.accept(dto.token,user);}
}
