import { Type } from 'class-transformer';import { IsDate } from 'class-validator';import { ApiProperty } from '@nestjs/swagger';
export class ScheduleCampaignDto { @ApiProperty({format:'date-time'}) @Type(()=>Date) @IsDate() scheduledAt!:Date; }

