import { IsString, IsEmail, IsOptional, IsUrl, MaxLength, MinLength, IsTimeZone } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
export class CreateOrganizationDto {
 @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) name!: string;
 @ApiProperty() @IsEmail() ownerEmail!: string;
 @ApiProperty() @IsString() @MinLength(1) @MaxLength(200) ownerName!: string;
}
export class UpdateOrganizationDto {
 @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(200) name?: string;
 @ApiPropertyOptional() @IsOptional() @IsUrl({ protocols: ['https'], require_protocol: true }) logo?: string;
 @ApiPropertyOptional() @IsOptional() @IsTimeZone() timezone?: string;
}

