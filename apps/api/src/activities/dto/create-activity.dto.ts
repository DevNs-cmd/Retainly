import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsObject, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
export enum ActivityType {
  EMAIL_OPENED='EMAIL_OPENED', EMAIL_CLICKED='EMAIL_CLICKED', UNSUBSCRIBED='UNSUBSCRIBED', COURSE_COMPLETE='COURSE_COMPLETE', SUBSCRIPTION_CANCELLED='SUBSCRIPTION_CANCELLED',
  LOGIN = 'LOGIN', LESSON_COMPLETE = 'LESSON_COMPLETE', QUIZ_PASS = 'QUIZ_PASS', QUIZ_FAIL = 'QUIZ_FAIL',
  VIDEO_WATCH = 'VIDEO_WATCH', ASSIGNMENT_SUBMIT = 'ASSIGNMENT_SUBMIT', COMMENT = 'COMMENT',
  FORUM_POST = 'FORUM_POST', PAYMENT_MADE = 'PAYMENT_MADE', PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_REQUESTED = 'REFUND_REQUESTED', LOGOUT = 'LOGOUT',
}
export class CreateActivityDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(128) studentId!: string;
  @ApiProperty({ enum: ActivityType }) @IsEnum(ActivityType) activityType!: ActivityType;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(80) source!: string;
  @ApiProperty({ type: Object }) @IsObject() payload!: Prisma.InputJsonObject;
  @ApiProperty({ format: 'date-time' }) @IsDateString() occurredAt!: string;
}
export class BatchActivityDto {
  @ApiProperty({ type: [CreateActivityDto], maxItems: 100 }) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100)
  @ValidateNested({ each: true }) @Type(() => CreateActivityDto) events!: CreateActivityDto[];
}

