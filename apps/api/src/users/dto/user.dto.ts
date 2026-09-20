import { IsString, IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator'; import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateUserDto { @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(200) name?: string; @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) avatar?: string; }

