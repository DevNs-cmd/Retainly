import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsInt, IsDate, Min, Max, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus, TaskStatus, Channel, Segment } from '../../data/entities';
export class CreateCampaignDto {
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) name!: string;
 @ApiProperty({ enum: Channel }) @IsEnum(Channel) type!: Channel;
 @ApiPropertyOptional({ enum: Segment }) @IsOptional() @IsEnum(Segment) segment?: Segment;
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) templateId!: string;
 @ApiPropertyOptional({}) @IsOptional() @IsString() @MinLength(1) @MaxLength(2000) message?: string;
}
export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

