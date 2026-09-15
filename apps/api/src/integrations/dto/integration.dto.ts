import { IsString, IsOptional, MaxLength, ValidateNested } from 'class-validator'; import { Type } from 'class-transformer'; import { ApiPropertyOptional } from '@nestjs/swagger';
export class CredentialsDto {
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10000) apiKey?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10000) accessToken?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10000) refreshToken?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) webhookSecret?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) accountId?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(254) from?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) subdomain?: string;
}
export class ConnectIntegrationDto {
 @ApiPropertyOptional({ type: CredentialsDto }) @IsOptional() @ValidateNested() @Type(() => CredentialsDto) credentials?: CredentialsDto;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) code?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) state?: string;
}

