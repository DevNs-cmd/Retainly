import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ActivityType } from './create-activity.dto';
export class ListActivitiesDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) studentId?: string;
  @ApiPropertyOptional({ enum: ActivityType }) @IsOptional() @IsEnum(ActivityType) type?: ActivityType;
}
