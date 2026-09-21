import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsInt, IsDate, Min, Max, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus, TaskStatus, Channel, Segment } from '../../data/entities';
export class CreateEnrollmentDto {
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) studentId!: string;
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) courseId!: string;
 @ApiProperty({ enum: EnrollmentStatus }) @IsEnum(EnrollmentStatus) status!: EnrollmentStatus;
 @ApiPropertyOptional({}) @IsOptional() @IsNumber() @Min(0) @Max(100) completionPercent?: number;
}
export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {}

