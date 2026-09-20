import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { Segment } from '../../data/entities';
export class ResourceQueryDto extends PaginationDto {
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) studentId?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) courseId?: string;
 @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) status?: string;
 @ApiPropertyOptional({ enum: Segment }) @IsOptional() @IsEnum(Segment) segment?: Segment;
 @ApiPropertyOptional({ enum: Segment }) @IsOptional() @IsEnum(Segment) riskLevel?: Segment;
}

