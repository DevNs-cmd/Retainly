import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsInt, IsDate, Min, Max, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus, TaskStatus, Channel, Segment } from '../../data/entities';
export class CreateCourseDto {
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) name!: string;
 @ApiPropertyOptional({}) @IsOptional() @IsString() @MinLength(1) @MaxLength(2000) description?: string;
}
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

