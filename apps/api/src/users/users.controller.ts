import { Controller, Get, Patch, Body } from '@nestjs/common'; import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'; import { UsersService } from './users.service'; import { UpdateUserDto } from './dto/user.dto';
@ApiTags('users') @ApiBearerAuth() @Controller('users/me') export class UsersController {
 constructor(private readonly service: UsersService) {}
 @Get() @ApiOperation({ summary: 'Current profile' }) @ApiResponse({ status: 200 }) me() { return this.service.me(); }
 @Patch() @ApiOperation({ summary: 'Update current profile' }) @ApiResponse({ status: 200 }) update(@Body() dto: UpdateUserDto) { return this.service.update(dto); }
}

