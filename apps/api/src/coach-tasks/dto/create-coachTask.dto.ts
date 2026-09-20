import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsInt, IsDate, Min, Max, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus, TaskStatus, Channel, Segment } from '../../data/entities';
export class CreateCoachTaskDto {
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) studentId!: string;
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) coachId!: string;
 @ApiPropertyOptional({}) @IsOptional() @IsString() @MinLength(1) @MaxLength(2000) automationRuleId?: string;
 @ApiProperty({}) @IsString() @MinLength(1) @MaxLength(2000) title!: string;
 @ApiPropertyOptional({}) @IsOptional() @IsString() @MinLength(1) @MaxLength(2000) notes?: string;
 @ApiPropertyOptional({ enum: TaskStatus }) @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
 @ApiPropertyOptional({}) @IsOptional() @Type(() => Date) @IsDate() dueDate?: Date;
}
export class UpdateCoachTaskDto extends PartialType(CreateCoachTaskDto) {}

