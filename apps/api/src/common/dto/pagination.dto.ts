import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class PaginationDto {
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1)
  page = 1;
  @ApiPropertyOptional({ default: 25, maximum: 100 }) @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit = 25;
  @ApiPropertyOptional({ enum: ['createdAt', 'occurredAt'] }) @IsOptional() @IsIn(['createdAt', 'occurredAt'])
  sortBy: 'createdAt' | 'occurredAt' = 'createdAt';
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsOptional() @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
  get skip() { return (this.page - 1) * this.limit; }
}
