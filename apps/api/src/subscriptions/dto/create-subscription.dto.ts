import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsInt, IsDate, Min, Max, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus, TaskStatus, Channel, Segment } from '../../data/entities';
export class CreateSubscriptionDto {
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) studentId!: string;
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) provider!: string;
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) externalId!: string;
 @ApiProperty({ enum: EnrollmentStatus }) @IsEnum(EnrollmentStatus) status!: EnrollmentStatus;
 @ApiProperty({}) @IsInt() @Min(0) @Max(Number.MAX_SAFE_INTEGER) amountMinor!: number;
 @ApiProperty({}) @Matches(/^[A-Z]{3}$/) currency!: string;
 @ApiProperty({}) @Type(() => Date) @IsDate() currentPeriodStart!: Date;
 @ApiProperty({}) @Type(() => Date) @IsDate() currentPeriodEnd!: Date;
}
export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}

