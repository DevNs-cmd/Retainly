import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsInt, IsDate, Min, Max, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus, TaskStatus, Channel, Segment } from '../../data/entities';
export class CreateStudentDto {
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) name!: string;
 @ApiProperty({}) @IsEmail() @MaxLength(254) email!: string;
 @ApiPropertyOptional({}) @IsOptional() @IsString() @MinLength(1) @MaxLength(2000) phone?: string;
 @ApiPropertyOptional({}) @IsOptional() @IsString() @MinLength(1) @MaxLength(2000) assignedCoachId?: string;
}
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

